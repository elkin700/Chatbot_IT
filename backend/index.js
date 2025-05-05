require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const conversations = {};

app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: "Faltan datos: sessionId o message" });
  }

  if (!conversations[sessionId]) {
    conversations[sessionId] = [];
  }

  conversations[sessionId].push({ role: "user", content: message });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversations[sessionId],
    });

    const iaResponse = response.choices[0].message.content;

    conversations[sessionId].push({ role: "assistant", content: iaResponse });

    res.json({ response: iaResponse });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error al conectar con la IA" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});