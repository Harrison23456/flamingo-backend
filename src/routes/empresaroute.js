const express = require('express');
const router = express.Router();
const Company = require('../modelos/empresa');
const authMiddleware = require('../middlewares/authMiddleware');

// Crear empresa
router.post('/crear-empresa', async (req, res) => {
  try {
    // Desestructuramos `req.body` para obtener los campos individuales, incluyendo `mobiles` como `initialMobiles`
    const { mobiles, ...empresaData } = req.body;

    // Creamos la nueva empresa usando los datos recibidos
    const finalCompany = new Company({
      ...empresaData,  // Incluimos el resto de los datos de la empresa
      initialMobiles: mobiles,  // Guardamos `mobiles` como `initialMobiles`
      mobiles: mobiles,  // También inicializamos el campo `mobiles` con el mismo valor
    });

    // Guardamos la empresa en la base de datos
    const savedCompany = await finalCompany.save();
    res.status(201).json(savedCompany);  // Respondemos con la empresa guardada
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtener empresas
router.get('/mis-empresas', async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar empresa
router.put('/mis-empresas/:id', async (req, res) => {
  try {
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar empresa
router.delete('/mis-empresas/:id', async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/empresas', async (req, res) => {
  try {
    const empresas = await Company.find();
    res.status(200).json(empresas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
