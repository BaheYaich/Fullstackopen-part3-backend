const express = require('express')
const app = express()
const morgan = require('morgan')
const uuid = require('node-uuid')
const cors = require('cors')

app.use(express.static('dist'))
app.use(cors())

morgan.token('body', (req) => {
    return JSON.stringify(req.body)
});


morgan.token('id', function getId(req) {
    return req.id
})

app.use(express.json())
app.use(express.urlencoded({ extended: true })); 
app.use(assignId)
app.use(morgan(':id :method :url :response-time :body'))

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    },
    {
        "id": "5",
        "name": "Backend person",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const number = persons.length
    const request_timestamp = new Date().toString()
    response.status(200).send(`<p>Phonebook has info for ${number} people</p><p>${request_timestamp}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).send('Current person does not exist')
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const existingIds = persons.map(person => Number(person.id))
    let randomId

    do {
        randomId = Math.floor(Math.random() * 10000)
    } while (existingIds.includes(randomId))
    return String(randomId)
}

const isDuplicate = (personName) => {
    const existingNames = persons.map(person => person.name)
    return existingNames.includes(personName)
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body);

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "information missing"
        })
    } else if (isDuplicate(body.name)) {
        return response.status(400).json({
            error: "name must be unique"
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})

function assignId(req, res, next) {
    req.id = uuid.v4()
    next()
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
