const express = require('express'); // Importation d'Express
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/authenticate');
const { User, CV } = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { fileURLToPath } = require('url');

const router = express.Router(); // Utilisation correcte de express.Router()





 // Assurez-vous que le modèle CV est bien importé


 

// Configuration de multer pour le téléchargement de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/pdfs'); // Dossier de destination
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Nom du fichier unique
  }
});

const upload = multer({ storage: storage });

// Route pour télécharger un fichier PDF
router.post('/uploads/pdfs', upload.single('file'), (req, res) => {
  try {
    // Vérifier si un fichier a été téléchargé
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier téléchargé' });
    }

    // Construire le chemin relatif du fichier téléchargé
    const relativePath = path.join('uploads', 'pdfs', req.file.filename).replace(/\//g, '\\\\');
    console.log('Fichier téléchargé :', relativePath); // Afficher le chemin relatif pour le debug

    // Retourner la réponse avec le chemin du fichier
    res.status(200).json({
      message: 'Fichier téléchargé avec succès',
      filePath: relativePath, // Retourner le chemin relatif avec les barres obliques inverses
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



router.post('/save', upload.single('cv'), async (req, res) => {
  try {
    // Vérifier si le fichier et les données sont présents
    if (!req.file || !req.body.name || !req.body.email) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Chemin du fichier PDF
    const pdfPath = path.join('uploads', 'pdfs', req.file.filename);

    // Création de l'objet CV
    const cv = new CV({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      jobTitle: req.body.jobTitle,
      profil: req.body.profil,
      pdfPath, // Chemin relatif du fichier PDF
      experience: JSON.parse(req.body.experience || '[]'),
      education: JSON.parse(req.body.education || '[]'),
      skills: JSON.parse(req.body.skills || '[]'),
      projects: JSON.parse(req.body.projects || '[]'),
      interests: JSON.parse(req.body.interests || '[]'),
      languages: JSON.parse(req.body.languages || '[]'),
      customSections: JSON.parse(req.body.customSections || '[]'),
    });

    // Sauvegarder dans la base de données
    await cv.save();

    res.status(201).json({ message: 'CV sauvegardé avec succès', cv });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du CV:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

router.get('/cvs', async (req, res) => {
  try {
    const cvs = await CV.find(); // Récupère tous les CVs
    const cvsWithPaths = cvs.map(cv => ({
      ...cv.toObject(),
      pdfPath: `${req.protocol}://${req.get('host')}/${cv.pdfPath}`,
    }));
    res.json(cvsWithPaths);
  } catch (error) {
    console.error('Erreur lors de la récupération des CVs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des CVs' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const cvId = req.params.id;

    // Vérifier si le CV existe
    const cv = await CV.findById(cvId);
    if (!cv) {
      return res.status(404).json({ error: 'CV non trouvé' });
    }

    // Supprimer le fichier associé au CV
    const filePath = path.resolve(cv.pdfPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer le CV de la base de données
    await CV.findByIdAndDelete(cvId);

    res.status(200).json({ message: 'CV supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});






























router.post('/search-cvs', async (req, res) => {
  const { skills, project, weights } = req.body; // weights contient les poids définis par la RH
  
  try {
    const query = {};
    if (skills) query['skills.name'] = { $regex: skills, $options: 'i' };
    if (project) query['projects.title'] = { $regex: project, $options: 'i' };

    const cvs = await CV.find(query).select('name email pdfPath skills projects experience');

    // Calcul du score des CVs en fonction des poids définis par la RH
    const weightedCVs = cvs.map(cv => {
      const skillsPoints = cv.skills ? cv.skills.length * (weights?.skills || 1) : 0;
      const projectPoints = cv.projects ? cv.projects.length * (weights?.projects || 1) : 0;
      const experiencePoints = cv.experience ? cv.experience.length * (weights?.experience || 1) : 0;

      return {
        ...cv.toObject(),
        score: skillsPoints + projectPoints + experiencePoints,
        skillsPoints,
        projectPoints,
        experiencePoints,
      };
    });

    res.status(200).json(weightedCVs);
  } catch (error) {
    console.error('Erreur lors de la recherche des CVs:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});






router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    
    console.log('Réponse utilisateur :', user); // Debug
    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});























  


router.post('/search-cvs', async (req, res) => {
  const { skills, project, weights } = req.body;

  try {
    const query = {};
    if (skills) query['skills.name'] = { $regex: skills, $options: 'i' };
    if (project) query['projects.title'] = { $regex: project, $options: 'i' };

    const cvs = await CV.find(query).select('name email pdfPath skills projects experience');

    const weightedCVs = cvs.map(cv => {
      const skillsPoints = cv.skills ? cv.skills.length * (weights?.skills || 1) : 0;
      const projectPoints = cv.projects ? cv.projects.length * (weights?.projects || 1) : 0;
      const experiencePoints = cv.experience ? cv.experience.length * (weights?.experience || 1) : 0;

      return {
        ...cv.toObject(),
        score: skillsPoints + projectPoints + experiencePoints,
        skillsPoints,
        projectPoints,
        experiencePoints,
      };
    });

    res.status(200).json(weightedCVs);
  } catch (error) {
    console.error('Erreur lors de la recherche des CVs:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});













// Inscription
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'L\'utilisateur existe déjà.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, 'votre_secret', { expiresIn: '1h' });
    res.status(201).json({ token, user: { name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, 'votre_secret', { expiresIn: '1h' });
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
    
  }
});
// Récupération du profil utilisateur



// Route pour récupérer le profil utilisateur
// Récupération du profil utilisateur
// Route pour récupérer le profil utilisateur




router.get('/search', async (req, res) => {
  const { skill, location, experience } = req.query;

  try {
    const query = {};

    if (skill) {
      query.skills = { $regex: skill, $options: 'i' }; // Recherche insensible à la casse
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (experience) {
      query.experience = { $gte: experience }; // Recherche par expérience minimum
    }

    const cvs = await CV.find(query); // Rechercher dans la collection des CV
    res.status(200).json(cvs);
  } catch (err) {
    console.error('Erreur lors de la recherche de CV:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});





router.post('/compare-cvs', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`file${index + 1}`, fs.createReadStream(file.path));
    });

    const response = await axios.post('https://api.gemini.com', formData, {
      headers: {
        'Authorization': `AIzaSyATt7df11dU479aemsBNN98fOq6iQck238`,
        ...formData.getHeaders(),
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la comparaison:', error);
    res.status(500).send('Erreur lors de la comparaison des CVs.');
  }
});

module.exports = router;
