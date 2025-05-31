const express = require('express');
const router = express.Router();
const Tarefa = require('../models/Tarefa');

router.post('/', async (req, res) => {
    try {
        const novaTarefa = await Tarefa.create(req.body);
        res.status(201).json(novaTarefa);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const tarefas = await Tarefa.find();
        res.json(tarefas);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const tarefa = await Tarefa.findById(req.params.id);
        if (!tarefa) return res.status(404).json({ msg: 'Tarefa não encontrada' });
        res.json(tarefa);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const tarefa = await Tarefa.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!tarefa) return res.status(404).json({ msg: 'Tarefa não encontrada' });
        res.json(tarefa);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const tarefa = await Tarefa.findByIdAndDelete(req.params.id);
        if (!tarefa) return res.status(404).json({ msg: 'Tarefa não encontrada' });
        res.json({ msg: 'Tarefa deletada com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.get('/filtro/consultar', async (req, res) => {
    try {
        const { status, prioridade, tag } = req.query;
        const filtro = {};

        if (status) filtro.status = status;
        if (prioridade) filtro.prioridade = prioridade;
        if (tag) filtro.tags = tag;

        const tarefas = await Tarefa.find(filtro)
            .sort({ dataCriacao: -1 })
            .limit(10)
            .select('titulo status prioridade');

        res.json(tarefas);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;
