const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Torna todos os arquivos acessíveis publicamente
app.use(express.static(path.join(__dirname, 'pages')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
