const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');  // Importer les routes d'authentification
const jwt = require('jsonwebtoken');  // Gardez cette ligne et supprimez l'autre ligne similaire
require('dotenv').config();
const app = express();
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');


app.use('/uploads/pdfs', express.static(path.join(__dirname, 'uploads','pdfs')));







// Configuration du serveur
const PORT = process.env.PORT || 5000; // Utilisation du port défini dans les variables d'environnement ou par défaut 5000

// Middleware CORS
// Configuration de CORS
app.use(cors({
  origin: 'http://localhost:4200',  // Autorise les requêtes depuis Angular
  methods: 'GET,POST,PUT,DELETE',  // Autorise ces méthodes HTTP
  allowedHeaders: 'Content-Type,Authorization',  // Autorise ces en-têtes
}));

// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());

// Middleware pour servir les fichiers statiques (dossier uploads)lyser le corps des requêtes




// Utilisation des routes d'authentification
app.use('/api/users', authRoutes);  // Route pour la gestion des utilisateurs (inscription, connexion)

console.log('Routes configurées pour /api/users');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/cv-app', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.log('Erreur de connexion à MongoDB :', err));

 
  
// Middleware de logs pour les requêtes
app.use((req, res, next) => {
  console.log(`Requête reçue : ${req.method} ${req.url}`);
  next();
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hammouguaassiya@gmail.com', // Remplacez par votre email Gmail
    pass: 'vdwb omxo cjok jytc', // Mot de passe d'application
  },
});

// Endpoint pour envoyer des emails
app.post('/send-email', (req, res) => {
  const { to, subject, message } = req.body;

  // Définir les options de l'email
  const mailOptions = {
    from: 'hammouguaassiya@gmail.com', // Adresse de l'expéditeur
    to, // Adresse du destinataire
    subject, // Sujet de l'email
    text: message, // Contenu de l'email
  };

  // Envoyer l'email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur lors de l\'envoi:', error);
      return res.status(500).send('Erreur lors de l\'envoi');
    }
    console.log('Email envoyé:', info.response);
    res.status(200).send('Email envoyé avec succès!');
  });
});
// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});


