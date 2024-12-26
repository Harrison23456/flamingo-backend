const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

require('./database');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use(cors());
app.use(bodyParser.json());

const authRoutes = require('./routes/auth');
const empresaRoutes = require('./routes/empresaroute');
const usuarioRoutes = require('./routes/userroute');
const salaRoutes = require('./routes/sala');
const clienteRoutes = require('./routes/clienteroute');
const usermobRoutes = require('./routes/mobile');


app.use('/api/auth', authRoutes);
app.use('/api/empresa', empresaRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/sala', salaRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/mobileroute', usermobRoutes);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));