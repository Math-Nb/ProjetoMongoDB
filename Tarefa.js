const mongoose = require('mongoose');

const tarefaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: String,
    status: { 
        type: String, 
        enum: ['pendente', 'em andamento', 'concluida'], 
        default: 'pendente' 
    },
    prioridade: { 
        type: String, 
        enum: ['baixa', 'media', 'alta'], 
        default: 'media' 
    },
    dataCriacao: { type: Date, default: Date.now },
    dataConclusao: Date,
    usuario: {
        id: mongoose.Schema.Types.ObjectId,
        nome: String
    },
    tags: [String]
});

tarefaSchema.index({ status: 1 });
tarefaSchema.index({ prioridade: 1 });
tarefaSchema.index({ 'usuario.id': 1 });

module.exports = mongoose.model('Tarefa', tarefaSchema);
