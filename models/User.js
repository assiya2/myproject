const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schéma de l'utilisateur
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['candidate', 'hr'] },
  profilePhoto: { type: String },
});
// Schéma pour le CV
const cvSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  jobTitle: { type: String },
  profil: { type: String },
  experience: [{ title: String, company: String, year: String }],
  education: [{ degree: String, school: String, year: String }],
  skills: [{ name: String }],
  projects: [{ title: String, description: String }],
  interests: [String],
  languages: [{ language: String, level: String }],
  customSections: [{ title: String, content: String }],
  pdfPath: { type: String, required: true }, // Chemin vers le fichier PDF
  createdAt: { type: Date, default: Date.now },
});


// Création du modèle à partir du schéma
const CV = mongoose.model('CV', cvSchema);
const User = mongoose.model('User', UserSchema);

// Exportation des modèles
module.exports = { User, CV };
