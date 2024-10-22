require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(cors())

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan(':method :url :response-time :body'))

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(result => {
    console.log('Phonebook: fetching all contacts')
    response.json(result)
  })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      const request_timestamp = new Date().toString()
      response.status(200).send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${request_timestamp}</p>
      `)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      console.log(`Phonebook: ${result.name} with number ${result.number} has been deleted`)
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const name = body.name
  const number = body.number
  console.log(body)

  if (!name || !number) {
    return response.status(400).json({
      error: 'information missing'
    })
  }

  Person.findOne({ name: name }).then(existingPerson => {
    if (existingPerson) {
      return response.status(400).json({ error: 'Name must be unique. Please update instead.' })
    } else {
      const person = new Person({ name, number })

      person.save()
        .then(savedPerson => {
          response.json(savedPerson)
        })
        .catch(error => next(error))
    }
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const name = body.name
  const number = body.number

  if (!name || !number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const person = {
    name: name,
    number: number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
