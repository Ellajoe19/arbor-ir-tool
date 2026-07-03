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
        'HTTP-Referer': 'https://arbor-ir-tool.netlify.app',
        'X-Title': 'Arbor IR Assessment'
      },
      body: JSON.stringify({
        model:'meta-llama/llama-3.2-1b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      const errDetail = data.error ? data.error.message : JSON.stringify(data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: errDetail })
      };
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
