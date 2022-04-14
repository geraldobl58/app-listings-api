const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const { validationResult, matchedData } = require('express-validator')

const User = require('../models/User')
const State = require('../models/State')

module.exports = {
  signin: async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json({ error: errors.mapped() })
      return
    }

    const data = matchedData(req)

    const user = await User.findOne({ email: data.email })

    if (!user) {
      res.json({ error: 'O e-mail/senha incorretos!' })

      return
    }

    const match = await bcrypt.compare(data.password, user.passwordHash)

    if (!match) {
      res.json({ error: 'O e-mail/senha incorretos!' })

      return
    }

    const payload = (Date.now() + Math.random()).toString()
    const token = await bcrypt.hash(payload, 10)

    user.token = token
    await user.save()

    res.json({ token, email: data.email })
  },

  signup: async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json({ error: errors.mapped() })
      return
    }

    const data = matchedData(req)

    const user = await User.findOne({
      email: data.email
    })

    if (user) {
      res.json({
        error: { email: { msg: 'O e-mail já existe' } }
      })

      return
    }


    if (mongoose.Types.ObjectId.isValid(data.state)) {
      const stateItem = await State.findById(data.state)

      if (!stateItem) {
        res.json({
          error: { email: { msg: 'O estado não existe' } }
        })

        return
      }
    } else {
      res.json({
        error: { email: { msg: 'O estado é inválido!' } }
      })

      return
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const payload = (Date.now() + Math.random()).toString()
    const token = await bcrypt.hash(payload, 10)

    const newUser = new User({
      name: data.name,
      email: data.email,
      passwordHash,
      token,
      state: data.state
    })

    await newUser.save()

    res.json({ token })
  },
}