const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET = 'uma_chave_secreta_super_segura';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

const db = new sqlite.Database('users.db');
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT
)`);
// Cadastro
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash],
    function(err) {
      if (err) return res.status(400).json({ error: 'E‑mail já cadastrado' });
      const token = jwt.sign({ id: this.lastID, email }, SECRET, { expiresIn: '1h' });
      res.json({ token });
    });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
    if (!row) return res.status(400).json({ error: 'Usuário não encontrado' });
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(400).json({ error: 'Senha incorreta' });
    const token = jwt.sign({ id: row.id, email }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});
function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Token ausente' });
  const token = header.split(' ')[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });
    req.user = decoded;
    next();
  });
}

// Rota protegida (painel interno)
app.get('/api/painel', auth, (req, res) => {
  res.json({ message: `Bem-vindo, usuário ${req.user.email}` });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
app.post('/api/registerAluno', (req, res) => {
  console.log('Dados recebidos:', req.body);
  // Aqui você poderá salvar em um banco de dados no futuro
  res.json({ message: 'Cadastro recebido com sucesso!' });
});
