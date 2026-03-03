const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://localhost:8080',
      changeOrigin: true,
      secure: false,
    })
  );


  app.use(
    '/connectorb',
    createProxyMiddleware({
      target: 'https://localhost:8081',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/connectorb': '' },
    })
  );

  app.use(
    '/brokerAPI',
    createProxyMiddleware({
      target: 'https://localhost:444',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/brokerAPI': '' },
    })
  );
};
