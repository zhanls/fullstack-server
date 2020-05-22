const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.post('/', (req, res) => {
  const body = req.body
  
  if (!body.content) {
    return res.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })

  note.save().then(savedNote => {
    res.json(savedNote)
  })
})

notesRouter.delete('/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(result => {
      // 不管删除资源请求成功与否，都向响应返回204状态码
      res.status(204).end()
    })
    .catch(error => next(error))
})

notesRouter.put('/:id', (req, res, next) => {
  const body = req.body
  
  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(req.params.id, note, { new: true })
    .then(updatedNote => {
      res.json(updatedNote)
    })
    .catch(error => next(error))
})

notesRouter.get('/', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes)
  })
})

notesRouter.get('/:id', (req, res) => {
  Note.findById(req.params.id)
    .then(foundNote => {
      if (foundNote) {
        res.json(foundNote)
      } else {
        res.status(404).end()
      }
    })
    .catch(err => {
      res.status(400).send({ error: 'malformed syntax' })
    })
})

module.exports = notesRouter