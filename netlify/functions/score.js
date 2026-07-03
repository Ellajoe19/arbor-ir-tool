exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const OPENROUTER_KEY = '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';

  try {
    const { prompt } = JSON.parse(event.body);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://whimsical-cascaron-1b6279.netlify.app',
        'X-Title': 'Arbor IR Assessment'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
        temperature: 0.3
      })
    });

    const raw = await response.text();
    
    let data;
    try { data = JSON.parse(raw); } 
    catch(e) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Bad JSON from OpenRouter: ' + raw.slice(0, 300) }) };
    }

    if (!data.choices || !data.choices[0]) {
      return { statusCode: 500, body: JSON.stringify({ error: data.error ? data.error.message : JSON.stringify(data).slice(0, 300) }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: data.choices[0].message.content })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
