// testShopify.js
const { shopifyApi, ApiVersion } = require("@shopify/shopify-api");
require('dotenv').config();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ["read_products", "write_products"],
  hostName: process.env.SHOPIFY_HOST.replace(/^https?:\/\//, ""),
  apiVersion: ApiVersion.July24, // use a versão atual
  isEmbeddedApp: false,
});

async function test() {
  const session = await shopify.session.customAppSession(process.env.SHOPIFY_STORE_DOMAIN);
  const client = new shopify.clients.Rest({ session });

  const products = await client.get({ path: "products" });
  console.log(products);
}

test().catch(console.error);