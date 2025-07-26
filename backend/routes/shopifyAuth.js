const express = require('express');
const router = express.Router();

const { startShopifyOAuth, handleShopifyCallback } = require('../services/shopify/oauthService');

router.get('/auth', startShopifyOAuth);
router.get('/callback', handleShopifyCallback);

module.exports = router;