const mongoose = require('mongoose');
const Counter = require('./contadores');

const clienteSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  imei: { type: String, required: true },
  sala: { type: mongoose.Schema.Types.ObjectId, ref: 'Sala', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Userweb', required: true }, 
  }, { timestamps: true });

// Middleware para autoincrementar el ID
clienteSchema.pre('save', async function (next) {

  try {
    // Obtener el contador para autoincrementar el ID
    const counter = await Counter.findOneAndUpdate(
      { modelName: 'Cliente' },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );

    this.id = counter.sequenceValue.toString().padStart(6, '0'); // 000001, 000002, etc.

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Cliente', clienteSchema);