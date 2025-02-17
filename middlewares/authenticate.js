// Middleware pour vérifier le token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Accès refusé' });

  try {
    const decoded = jwt.verify(token, 'votre_secret');
    req.userId = decoded.id; // Assurez-vous que l'ID de l'utilisateur est ajouté à la requête
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Token invalide' });
  }
};

module.exports = verifyToken;
