import OpenAI from 'openai'
import { getStaticFile, throwIfMissing } from './utils.js'

export default async ({ req, res }) => {
  throwIfMissing(process.env, ['OPENAI_API_KEY'])

  // Handle GET request
  if (req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    })
  }

  throwIfMissing(process.env, ['OPENAI_API_KEY'])

  if (req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    })
  }

  // Handle POST request
  if (req.method === 'POST') {
    throwIfMissing(req.body, ['prompt'])

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? '512'),
        messages: [{ role: 'user', content: req.body.prompt }],
      })
      const completion = response.choices[0].message.content
      return res.status(200).json({ ok: true, completion })
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message })
    }
  }

  // Handle unsupported HTTP methods
  return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
}
