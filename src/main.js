import OpenAI from 'openai';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res }) => {
  const { method, body } = req;
  const { send, json } = res;

  throwIfMissing(process.env, ['OPENAI_API_KEY']);

  if (method === 'GET') {
    return send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  try {
    throwIfMissing(body, ['prompt']);
  } catch (err) {
    return json({ ok: false, error: err.message }, 400);
  }

  const openai = new OpenAI();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? '512'),
      messages: [{ role: 'user', content: body.prompt }],
    });
    const completion = response.choices[0]?.message?.content;
    return json({ ok: true, completion }, 200);
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
};
