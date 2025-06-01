const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai'); // Add OpenAI package

const app = express();
require('dotenv').config()
const PORT = process.env.PORT || 3000;

const ModelClient = require("@azure-rest/ai-inference").default;
const { AzureKeyCredential } = require("@azure/core-auth");

// Enable CORS
app.use(cors());

// Use body-parser middleware to parse request bodies
app.use(bodyParser.json());

// MongoDB Atlas connection URL
const mongoURI= process.env.mongoURI;

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Create a Mongoose schema (same as before)
const doctorSchema = new mongoose.Schema({
  ID: Number,
  Name: String,
  Specialization: String,
  Location: String,
  Phone: String,
  Email: String,
  'Availability-1': String,
  'Availability-2': String,
  'Charge per Hour': Number,
  Rank: Number,
});

// Create a Mongoose model (same as before)
const Doctor = mongoose.model('Doctor', doctorSchema);

// Define a route to retrieve and display the doctor data (same as before)
app.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Create a new doctor
app.post('/doctors', async (req, res) => {
  try {
    const newDoctor = new Doctor(req.body);
    const savedDoctor = await newDoctor.save();
    res.json(savedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Update an existing doctor
app.put('/doctors/:id', async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Delete a doctor
app.delete('/doctors/:id', async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// AI functionality: Rank user based on psych assessment
const token = process.env.token; 
const endpoint = process.env.endpoint;
const modelName = "gpt-4o";
const aiModelName = "ai21-jamba-1.5-mini";

const aiClient = new ModelClient(endpoint, new AzureKeyCredential(token));
const client = new OpenAI({ baseURL: endpoint, apiKey: token });


// Define an endpoint to rank the user
app.post('/rank', async (req, res) => {
  const userContent = req.body.content; // Assuming the psych assessment details are passed in the request body

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "Rank this user from 1 to 15 (both numbers included) according to the details provided from a psych assessment quiz, return only the number" },
        { role: "user", content: userContent }
      ],
      model: modelName,
      temperature: 1.0,
      max_tokens: 2,
      top_p: 1.0
    });

    const rank = response.choices[0].message.content;
    res.json({ rank: rank.trim() }); // Return the rank as a JSON response
  } catch (error) {
    console.error("Error with OpenAI request:", error);
    res.status(500).json({ error: 'AI Error' });
  }
});

const conversations = {};

app.post('/doctorchat', async (req, res) => {
  const userQuery = req.body.content;
  const doctorName = req.query.doctor; // Get doctor name from query parameters

  if (!conversations[doctorName]) {
    conversations[doctorName] = [];
  }

  conversations[doctorName].push({ role: 'user', content: userQuery });

  const context = conversations[doctorName].map(m => `${m.role}: ${m.content}`).join('; ');

  const systemMessage = `You are a doctor named ${doctorName}, operating out of the city ${req.query.city}, with your profile description as ${req.query.description}, providing chat support as a professional on the site Virtuwell, which is a leading site for online professional psychiatric and mental wellness help and support. You are to assist the user in clearing out their doubts regarding mental health while also subtly putting out recommendations to book a doctor with us, a 40% salesman and a 60% doctor. Remember to gatekeep as much information as possible while you deliver information that seems credible and helpful to the user in the conversation. Respond as humanely as possible while trying to sell the product Virtuwell, the online professional psychologist booking service on which you are working on. Response must be short and concise, and must be in a friendly tone. Don't use markdown replies, use normal text. Always respond as a doctor and not as a salesman.`;

  try {
    const response = await aiClient.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: `${userQuery}; Context: ${context}` }
        ],
        model: aiModelName,
      }
    });

    if (response.status !== "200") {
      throw response.body.error;
    }

    const aiReply = response.body.choices[0].message.content;
    conversations[doctorName].push({ role: 'assistant', content: aiReply });
    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Error with AI request:", error);
    res.status(500).json({ error: 'AI Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
