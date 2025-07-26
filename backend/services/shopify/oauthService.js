const fetch = require('node-fetch'); // instale se ainda não tiver

async function handleShopifyCallback(req, res) {
  const { code, hmac, shop } = req.query;

  const generatedHash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(querystring.stringify({ code, shop }))
    .digest('hex');

  if (generatedHash !== hmac) {
    return res.status(400).send('HMAC validation failed');
  }

  const accessTokenUrl = `https://${shop}/admin/oauth/access_token`;

  try {
    const response = await fetch(accessTokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (!data.access_token) {
      console.error('Erro ao obter access_token:', data);
      return res.status(500).send('Erro ao obter o access_token da Shopify');
    }

    console.log('✅ Access Token recebido:', data.access_token);

    // Aqui você pode salvar no banco de dados, cache, etc...
    // Por enquanto só mostra na tela:
    res.send(`Access token obtido: ${data.access_token}`);
  } catch (error) {
    console.error('Erro na requisição do access token:', error);
    res.status(500).send('Erro interno ao tentar obter access token');
  }
}