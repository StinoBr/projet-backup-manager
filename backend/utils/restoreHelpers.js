const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper'); // Outil de décompression
const CryptoService = require('./CryptoService'); // Pour déchiffrer le mot de passe

/**
 * Gère l'exécution d'une restauration.
 * @param {object} backupLog - Le log de sauvegarde (contient le fichier source)
 * @param {object} targetConfig - La config BDD *cible*
 * @returns {Promise<string>} Le message de succès
 */
async function executeRestore(backupLog, targetConfig) {
  const { filePath: backupFilePath } = backupLog;
  const { dbType, host, port, username, databaseName } = targetConfig;

  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Fichier de sauvegarde introuvable: ${backupFilePath}`);
  }

  // 1. Déchiffrer le mot de passe de la BDD *cible*
  const password = CryptoService.decrypt(targetConfig.password);

  // 2. Gérer la décompression
  // Si le fichier est un .zip, on l'extrait dans un .sql temporaire
  let sqlFilePath;
  let isTempFile = false;

  if (path.extname(backupFilePath) === '.zip') {
    const tempDir = path.dirname(backupFilePath);
    const tempSqlFilename = `${path.basename(backupFilePath, '.zip')}-temp.sql`;
    sqlFilePath = path.join(tempDir, tempSqlFilename);
    isTempFile = true;

    console.log(`[Restore] Décompression de ${backupFilePath} vers ${sqlFilePath}...`);
    try {
      await extractZip(backupFilePath, sqlFilePath);
    } catch (err) {
      throw new Error(`Échec de la décompression: ${err.message}`);
    }
  } else {
    // Le fichier est déjà un .sql
    sqlFilePath = backupFilePath;
  }

  // 3. Définir la commande de restauration
  let command;
  let args;
  const env = { ...process.env };

  switch (dbType) {
    case 'postgres':
      env.PGPASSWORD = password;
      command = 'psql';
      args = [
        `--host=${host}`,
        `--port=${port}`,
        `--username=${username}`,
        `--dbname=${databaseName}`,
        `--file=${sqlFilePath}` // Importe depuis le fichier
      ];
      break;

    case 'mysql':
      command = 'mysql';
      args = [
        `--host=${host}`,
        `--port=${port}`,
        `--user=${username}`,
        `--password=${password}`,
        databaseName
        // On redirigera le fichier en stdin
      ];
      break;
    
    default:
      if (isTempFile) fs.unlinkSync(sqlFilePath); // Nettoyage
      throw new Error(`Restauration non supportée pour ${dbType}`);
  }

  // 4. Exécuter la commande
  try {
    await runProcess(command, args, env, dbType, sqlFilePath);
    const successMessage = `Restauration de ${databaseName} depuis ${sqlFilePath} terminée.`;
    
    // 5. Nettoyage du .sql temporaire
    if (isTempFile) {
      fs.unlinkSync(sqlFilePath);
      console.log(`[Restore] Fichier temporaire ${sqlFilePath} supprimé.`);
    }
    return successMessage;
  } catch (error) {
    if (isTempFile) fs.unlinkSync(sqlFilePath); // Nettoyage en cas d'échec
    throw error;
  }
}

/**
 * Utilitaire pour exécuter le processus de restauration.
 */
function runProcess(command, args, env, dbType, sqlFilePath) {
  return new Promise((resolve, reject) => {
    console.log(`[Restore] Démarrage: ${command} ${args.join(' ')}`);
    const process = spawn(command, args, { env });

    // Pour MySQL, on doit "piper" le fichier SQL dans stdin
    if (dbType === 'mysql') {
      const fileStream = fs.createReadStream(sqlFilePath);
      fileStream.pipe(process.stdin);
      fileStream.on('error', (err) => reject(err));
    }

    let errorOutput = '';
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`[Restore] Succès: ${command}`);
        resolve();
      } else {
        console.error(`[Restore] Échec (Code: ${code}): ${errorOutput}`);
        reject(new Error(errorOutput || `La commande ${command} a échoué`));
      }
    });

    process.on('error', (err) => {
      console.error(`[Restore] Erreur Spawn: ${err.message}`);
      reject(err);
    });
  });
}

/**
 * Utilitaire pour extraire un .zip (en supposant 1 seul .sql dedans).
 */
function extractZip(zipPath, outputPath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        // On prend le premier fichier .sql qu'on trouve
        if (path.extname(entry.path) === '.sql') {
          entry.pipe(fs.createWriteStream(outputPath))
            .on('finish', resolve)
            .on('error', reject);
        } else {
          entry.autodrain(); // On ignore les autres fichiers
        }
      })
      .on('error', reject);
  });
}

module.exports = { executeRestore };