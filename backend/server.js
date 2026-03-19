require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MURF_API_KEY = process.env.MURF_API_KEY;

app.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await axios.post(
      "https://api.murf.ai/v1/speech/generate",
      {
        text: text,
        voiceId: "en-US-natalie",
      },
      {
        headers: {
          "api-key": MURF_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      audioUrl: response.data.audioFile,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating speech");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});