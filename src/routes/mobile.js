const express = require('express');
const bcrypt = require('bcrypt');
const Userweb = require('../modelos/usuario'); // Ajusta la ruta según tu proyecto
const Reportes = require('../modelos/reportes'); // Ajusta la ruta según tu proyecto
const jwt = require('jsonwebtoken');
const Company = require('../modelos/empresa'); // Asegúrate de que la ruta sea correcta
const axios = require('axios');
const DniScan = require('../modelos/dni');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Login
router.post('/login', async (req, res) => {
  const { email, password, usermobile, passwordmobile } = req.body;

  try {

    // Buscar en la colección Userweb si no se encuentra en User
    let userwe = await Userweb.findOne({ usermobile });
    if (userwe) {
      
      const idempresa = userwe.company._id;
      const isMatch = await bcrypt.compare(passwordmobile, userwe.passwordmobile);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    // Verificar si la empresa está activa
      const company = await Company.findOne({ _id: idempresa });

      if (!company) {
        return res.status(404).json({ error: 'Empresa no encontrada' });
      }

      // Verificar si la empresa está desactivada
      if (!company.status) {
        return res.status(403).json({ error: 'La empresa está desactivada' });
      }

      // Verificar si la fecha de fin ha pasado
      const today = new Date();
      if (company.fechaFin && company.fechaFin < today) {
        return res.status(403).json({ error: 'La fecha de expiración de la empresa ha pasado' });
      }

      const token = jwt.sign({ id: userwe._id, type: 'userweb', user: userwe }, process.env.JWT_SECRET, { expiresIn: '5h' });

      return res.status(200).json({
        token,
        user: { name: userwe.name, email: userwe.userweb, type: 'userweb' },
      });
    }

    // Si no se encuentra en ninguna colección
    return res.status(404).json({ error: 'User not found' });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
    console.error(error);
  }
});

router.get('/proxy-dni/:dni', async (req, res) => {
    const { dni } = req.params;
    const API_URL = 'https://api.apis.net.pe/v1/dni';
    const API_TOKEN = 'TU_TOKEN_DE_APIS.NET.PE';
  
    try {
      const response = await axios.get(API_URL, {
        params: { numero: dni },
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
  
      res.json(response.data); // Enviar datos de la API al frontend
    } catch (error) {
      console.error('Error al consultar la API externa:', error.message);
      res.status(500).json({
        message: 'Error al consultar la API externa.',
        details: error.message,
      });
    }
  });
  
  // Ruta para guardar datos del DNI en la base de datos
  router.post('/saveDniData', async (req, res) => {
    const { dni, nombre, apellido_paterno, apellido_materno } = req.body;
  
    try {
      const newReport = new Reportes({
        dni,
        nombre,
        apellido_paterno,
        apellido_materno,
        date: new Date(),
      });
  
      await newReport.save();
      res.status(201).json({ message: 'Reporte guardado correctamente.' });
    } catch (error) {
      console.error('Error al guardar el reporte:', error);
      res.status(500).json({ message: 'Error al guardar el reporte.' });
    }
  });
  
  router.post('/barscan', async (req, res) => {
    const { dni, barcodeDni } = req.body;
    
    if (!dni || !barcodeDni) {
      return res.status(400).json({ error: 'DNI y código de barras son necesarios.' });
    }
  
    // Verificar si el DNI coincide con el código de barras
    if (dni === barcodeDni) {
      try {
        // Guardar la entrada en la base de datos
        const scan = new DniScan({ dni, barcodeDni });
        await scan.save();
        return res.status(200).json({ success: true, message: 'DNI y código de barras coinciden.' });
      } catch (error) {
        console.error('Error al guardar el escaneo:', error);
        return res.status(500).json({ error: 'Error al guardar el escaneo.' });
      }
    } else {
      return res.status(400).json({ error: 'El DNI y el código de barras no coinciden.' });
    }
  });

  // Save and validate scan
router.post("/validate", async (req, res) => {
  const { barcode, dni } = req.body;

  const match = barcode === dni;
  const scan = new Scan({ barcode, dni, match });
  await scan.save();

  res.json({ success: true, match });
});
  

module.exports = router;
