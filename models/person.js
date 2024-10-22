const mongoose = require('mongoose')

// Disable strict query mode (useful for handling deprecated query behaviors)
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI // Retrieve the MongoDB connection string from environment variables

console.log('connecting to', url)

// Establish connection to the MongoDB database
mongoose.connect(url)
  // eslint-disable-next-line no-unused-vars
  .then(result => {
    console.log('connected to MongoDB') // Log success message when connection is established
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message) // Log error message if connection fails
  })

// Define the schema for 'Person' documents in the MongoDB collection
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3, // Name must be at least 3 characters long
    required: true // Name field is required
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        // Validate phone number format: either XX-XXXXX or XXX-XXXXXX (e.g., 12-34567 or 123-456789)
        return /^\d{2,3}-\d{5,}$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!  It should be in the format XX-XXXXXXX or XXX-XXXXXXXX.`
    },
    required: [true, 'Contact phone number required'] // Number field is required with a custom error message
  },
})

// Modify the JSON response: convert '_id' to 'id' and remove MongoDB-specific fields '__v' and '_id'
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString() // Convert MongoDB _id to a string format
    delete returnedObject._id // Remove _id field from the response
    delete returnedObject.__v // Remove version field from the response
  }
})

module.exports = mongoose.model('Person', personSchema, 'people') // Export the model for 'Person' in the 'people' collection