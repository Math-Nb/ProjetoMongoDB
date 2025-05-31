const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors()); // Liberar CORS para o front
app.use(express.json());

// Conexão com MongoDB 
mongoose.connect('mongodb+srv://matheus:12345@tarefas.i0l9nqo.mongodb.net/?retryWrites=true&w=majority&appName=Tarefas', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error('Erro na conexão MongoDB:', err));

// Definição do schema com indexação para otimização
const TarefaSchema = new mongoose.Schema({
  titulo: { type: String, required: true, index: true },  // índice simples para título
  descricao: { type: String },
  status: { type: String, enum: ['pendente', 'concluida'], default: 'pendente', index: true }, // índice para filtro rápido
  criadaEm: { type: Date, default: Date.now },
});

// Índice composto opcional (exemplo para consultas combinadas)
// TarefaSchema.index({ status: 1, criadaEm: -1 });

const Tarefa = mongoose.model('Tarefa', TarefaSchema);

/* ROTAS */

// Listar todas tarefas (com projeção e ordenação)
app.get('/tarefas', async (req, res) => {
  try {
    const tarefas = await Tarefa.find({}, 'titulo status criadaEm')
                              .sort({ criadaEm: -1 })  // mais recentes primeiro
                              .limit(50);              // limitar resultado para otimizar
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

// Listar tarefas por status (filtro com operador $in, ordenação)
app.get('/tarefas/status', async (req, res) => {
  try {
    // Permitir filtrar por vários status via query: ?status=pendente,concluida
    const statusQuery = req.query.status ? req.query.status.split(',') : ['pendente', 'concluida'];
    
    const tarefas = await Tarefa.find({ status: { $in: statusQuery } })
                              .sort({ criadaEm: -1 });
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tarefas por status' });
  }
});

// Buscar tarefa específica com projeção e checando existência
app.get('/tarefas/:id', async (req, res) => {
  try {
    const tarefa = await Tarefa.findById(req.params.id, 'titulo descricao status criadaEm');
    if (!tarefa) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tarefa' });
  }
});

// Criar nova tarefa
app.post('/tarefas', async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    if (!titulo) return res.status(400).json({ error: 'Título é obrigatório' });
    
    const tarefa = new Tarefa({ titulo, descricao });
    await tarefa.save();
    res.status(201).json(tarefa);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// Atualizar tarefa (permitindo atualizar título, descrição e status)
app.put('/tarefas/:id', async (req, res) => {
  try {
    const { titulo, descricao, status } = req.body;

    // Validação simples do status
    if (status && !['pendente', 'concluida'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const tarefa = await Tarefa.findByIdAndUpdate(
      req.params.id,
      { titulo, descricao, status },
      { new: true, runValidators: true }
    );

    if (!tarefa) return res.status(404).json({ error: 'Tarefa não encontrada' });

    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

// Deletar tarefa
app.delete('/tarefas/:id', async (req, res) => {
  try {
    const tarefa = await Tarefa.findByIdAndDelete(req.params.id);
    if (!tarefa) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar tarefa' });
  }
});

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});