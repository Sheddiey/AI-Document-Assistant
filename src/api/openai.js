import rateLimit from "express-rate-limit";
import { Configuration, OpenAIApi } from "openai";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const analyzeTextHandler = async (req, res) => {
  const { content } = req.body;

  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "Text content is required." });
  }

  try {
    const result = await openai.createCompletion({
      model: "text-curie-001", // Switch to a more cost-effective model
      prompt: `Improve the following text for grammar, clarity, and readability:\n\n${content}`,
      max_tokens: 500,
      temperature: 0.7,
    });

    return res.json({ suggestions: result.data.choices[0].text.trim() });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return res.status(500).json({ error: "Failed to fetch suggestions." });
  }
};


export default analyzeTextHandler;
