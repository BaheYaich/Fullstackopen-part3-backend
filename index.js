require('dotenv').config() // Load environment variables from .env file

const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person') // Mongoose model for the 'persons' collection

app.use(express.static('dist')) // Serve static files from the 'dist' directory (frontend build)
app.use(cors()) // Enable Cross-Origin Resource Sharing

// Custom morgan token to log the request body in POST/PUT requests
morgan.token('body', (req) => JSON.stringify(req.body))

// Middleware to handle unknown endpoints (404 errors)
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Centralized error handling for various types of errors
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' }) // Handle invalid MongoDB IDs
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message }) // Handle Mongoose validation errors
  }

  next(error)
}

app.use(express.json()) // Middleware to parse JSON request bodies
app.use(morgan(':method :url :response-time :body')) // Log HTTP requests and body details

// Get all persons
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(result => response.json(result))
    .catch(error => next(error)) // Pass errors to error handler
})

// Get total count and info about the phonebook
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

// Get a specific person by ID
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end() // If person not found, return 404
      }
    })
    .catch(error => next(error))
})

// Delete a person by ID
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => response.status(204).end()) // Return 204 (No Content) if deletion is successful
    .catch(error => next(error))
})

// Add a new person
app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({ error: 'information missing' }) // Validate required fields
  }

  Person.findOne({ name }) // Ensure name is unique
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({ error: 'Name must be unique. Please update instead.' })
      } else {
        const person = new Person({ name, number }) // Create new person object
        person.save()
          .then(savedPerson => response.json(savedPerson))
          .catch(error => next(error))
      }
    })
    .catch(error => next(error))
})

// Update a person's details
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  const person = { name, number }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})

app.use(unknownEndpoint) // Handle unknown endpoints
app.use(errorHandler) // Apply error handler

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`) 
})