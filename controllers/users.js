const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (req, res, next) => {
  const body = req.body
  
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash
  })

  user.save()
    .then(savedUser => {
      res.json(savedUser)
    })
    .catch(error => next(error))
})

// usersRouter.delete('/:id', async (req, res, next) => {
//   User.findByIdAndRemove(req.params.id)
//     .then(result => {
//       res.status(204).end()
//     })
//     .catch(error => next(error))
// })

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('notes')
  res.json(users.map(u => u.toJSON()))
})

module.exports = usersRouter