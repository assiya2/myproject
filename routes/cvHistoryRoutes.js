const express = require('express');  // Assurez-vous que express est importé
const cvHistoryController = require('../controllers/cvHistoryController');  // Importer votre contrôleur
const router = express.Router();  // Créez le routeur

// Définir les routes pour l'historique des CV
router.post('/cv-history/add', cvHistoryController.addCvToHistory);
router.get('/cv-history/history/:userId', cvHistoryController.getUserCvHistory);

// Exporter le routeur pour l'utiliser ailleurs dans l'application
module.exports = router;
