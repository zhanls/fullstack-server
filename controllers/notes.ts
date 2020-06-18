import express from 'express'
const notesRouter: express.Router = express.Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = (req: express.Request): string => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  } else {
    return ''
  }
}

notesRouter.post('/', async (req, res) => {
  const body = req.body
  const token = getTokenFrom(req)
  
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    res.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(body.userId)
  
  if (!body.content) {
    return res.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user.id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote.id)
  await user.save()

  res.json(savedNote.toJSON())
})

notesRouter.delete('/:id', async (req, res, next) => {
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

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  res.json(notes.map(note => note.toJSON()))
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