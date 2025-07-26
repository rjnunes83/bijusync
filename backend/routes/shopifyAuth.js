router.get('/auth', startShopifyOAuth);
router.get('/callback', handleShopifyCallback);