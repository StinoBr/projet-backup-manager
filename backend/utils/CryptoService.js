const crypto = require('crypto');

// Récupère la clé secrète depuis les variables d'environnement
const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY; 

// Vérifie que la clé est bien définie
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length === 0) {
  throw new Error('La variable d\'environnement CREDENTIAL_ENCRYPTION_KEY est manquante.');
}

// Algorithme de chiffrement. 'aes-256-cbc' est un standard robuste.
const ALGORITHM = 'aes-256-cbc';
// Longueur de la clé (32 octets pour AES-256)
const KEY_LENGTH = 32;
// Longueur du vecteur d'initialisation (16 octets pour AES)
const IV_LENGTH = 16;

/**
 * Dérive une clé de 32 octets à partir de la clé fournie dans .env
 * Quelle que soit la longueur de la clé dans .env, on la "hashe" pour
 * obtenir une clé de longueur fixe (32 octets) pour AES-256.
 */
function getKey() {
  return crypto
    .createHash('sha256')
    .update(String(ENCRYPTION_KEY))
    .digest()
    .slice(0, KEY_LENGTH); // Prend les 32 premiers octets
}

/**
 * Service pour chiffrer et déchiffrer les credentials des BDD cibles.
 */
class CryptoService {
  /**
   * Chiffre une chaîne de texte.
   * @param {string} text - Le texte en clair (ex: le mot de passe)
   * @returns {string} Le texte chiffré (contient IV + texte chiffré)
   */
  encrypt(text) {
    try {
      // Génère un Vecteur d'Initialisation (IV) aléatoire pour chaque chiffrement
      // C'est crucial pour la sécurité.
      const iv = crypto.randomBytes(IV_LENGTH);
      
      // Crée l'outil de chiffrement
      const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
      
      // Chiffre le texte
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Retourne l'IV + le texte chiffré, séparés par ':'
      // On a besoin de l'IV pour le déchiffrement.
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error("Erreur de chiffrement :", error);
      throw new Error("Impossible de chiffrer les données.");
    }
  }

  /**
   * Déchiffre une chaîne de texte.
   * @param {string} text - Le texte chiffré (ex: "iv:encryptedText")
   * @returns {string} Le texte en clair
   */
  decrypt(text) {
    try {
      // Sépare l'IV du texte chiffré
      const parts = text.split(':');
      if (parts.length !== 2) {
        throw new Error('Format de texte chiffré invalide.');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      
      // Crée l'outil de déchiffrement
      const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
      
      // Déchiffre le texte
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error("Erreur de déchiffrement :", error);
      // Ne pas logger l'erreur en production si elle contient des données sensibles
      throw new Error("Impossible de déchiffrer les données.");
    }
  }
}

// Exporte une instance unique du service
module.exports = new CryptoService();