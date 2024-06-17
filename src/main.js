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

  if (req.method === 'OPTIONS') {
    return res.send('', 200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
  }

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
      return res.json({ ok: true, completion }, 200, {
        'Access-Control-Allow-Origin': '*',
      })
    } catch (err) {
      return res.json({ ok: false, error: err.message }, 500, {
        'Access-Control-Allow-Origin': '*',
      })
    }
  }

  // Handle unsupported HTTP methods
  return res.json({ ok: false, error: 'Method Not Allowed' }, 405, {
    'Access-Control-Allow-Origin': '*',
  })
}
