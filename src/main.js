import OpenAI from 'openai'
import { getStaticFile, throwIfMissing } from './utils.js'

export default async ({ req, res }) => {
  // Add CORS headers
  const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  setCorsHeaders(res)

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.send(null, 204)
  }

  throwIfMissing(process.env, ['OPENAI_API_KEY'])

  // Handle GET request
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
      return res.json({ ok: true, completion }, 200)
    } catch (err) {
      return res.json({ ok: false, error: err.message }, 500)
    }
  }

  // Handle unsupported HTTP methods
  return res.json({ ok: false, error: 'Method Not Allowed' }, 405)
}
