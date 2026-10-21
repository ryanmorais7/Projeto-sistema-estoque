module.exports = {
  e2e: {
    supportFile: false,
    // Site servido localmente (ex.: Live Server do VS Code na porta 5500).
    // Para testar o preview da Vercel: npx cypress run --config baseUrl=https://<preview>.vercel.app
    baseUrl: 'http://127.0.0.1:5500',
  },
};
