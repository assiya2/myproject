const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./user.model');  // Importer le modèle d'utilisateur

// Route pour la connexion
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Vérifier si les champs sont remplis
  if (!email || !password) {
    return res.status(400).send({ error: 'Email et mot de passe sont requis.' });
  }

  try {
    // Recherche de l'utilisateur dans la base de données
    const user = await User.findOne({ email });

    // Si l'utilisateur n'existe pas
    if (!user) {
      return res.status(400).send({ error: 'Email ou mot de passe incorrect' });
    }

    // Comparer les mots de passe
    const isMatch = await user.comparePassword(password);

    // Si les mots de passe ne correspondent pas
    if (!isMatch) {
      return res.status(400).send({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, 'votre_clé_secrète', { expiresIn: '1h' });

    // Envoyer le token dans la réponse
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Erreur du serveur' });
  }
});
