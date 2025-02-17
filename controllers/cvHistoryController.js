const { User, CV } = require('../models/User'); 
// Route pour ajouter un CV à l'historique
exports.addCvToHistory = async (req, res) => {
    try {
      // Implémentation de l'ajout de CV à l'historique
      const { userId, templateName, cvData } = req.body;
      const newCv = new CV({ userId, templateName, cvData });
      await newCv.save();
      res.status(200).json({ message: 'CV ajouté à l\'historique' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de l\'ajout du CV' });
    }
  };

// Route pour récupérer l'historique des CV d'un utilisateur
exports.getUserCvHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cvHistory = await CV.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(cvHistory);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique', error: err });
  }
};
