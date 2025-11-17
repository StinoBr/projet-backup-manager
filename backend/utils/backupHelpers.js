const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const CryptoService = require('./CryptoService'); // Pour déchiffrer le mot de passe

/**
 * Gère l'exécution d'une sauvegarde pour une tâche donnée.
 * C'est le fichier le plus complexe.
 * @param {object} job - L'objet BackupJob complet (avec sa config)
 * @returns {Promise<{filePath: string, fileSize: number}>}
 */
function executeBackup(job) {
  const { config, storagePath, compression } = job;
  const { dbType, host, port, username, databaseName } = config;

  // 1. Déchiffrer le mot de passe
  const password = CryptoService.decrypt(config.password);

  // 2. Définir le nom et le chemin du fichier
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseFilename = `${databaseName}-${timestamp}`;
  const sqlFilename = `${baseFilename}.sql`;
  const zipFilename = `${baseFilename}.zip`;
  
  // S'assure que le dossier de destination existe
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  const outputSqlPath = path.join(storagePath, sqlFilename);
  const outputZipPath = path.join(storagePath, zipFilename);

  // 3. Retourner une Promesse pour gérer l'asynchronisme
  return new Promise(async (resolve, reject) => {
    let command;
    let args;
    const env = { ...process.env }; // Copie de l'environnement

    // 4. Définir la commande en fonction du SGBD
    switch (dbType) {
      case 'postgres':
        env.PGPASSWORD = password; // pg_dump utilise cette variable d'env
        command = 'pg_dump';
        args = [
          `--host=${host}`,
          `--port=${port}`,
          `--username=${username}`,
          `--dbname=${databaseName}`,
          '--format=plain', // Sortie SQL simple
          `--file=${outputSqlPath}` // Écrit dans le fichier
        ];
        break;

      case 'mysql':
        command = 'mysqldump';
        args = [
          `--host=${host}`,
          `--port=${port}`,
          `--user=${username}`,
          `--password=${password}`,
          databaseName
          // On redirigera stdout vers un fichier
        ];
        break;
      
      // TODO: Ajouter la logique pour SQLite (ex: copier le fichier)
      case 'sqlite':
        reject(new Error('La sauvegarde SQLite n\'est pas encore implémentée.'));
        return;

      default:
        reject(new Error(`Type de BDD non supporté: ${dbType}`));
        return;
    }

    try {
      // 5. Exécuter la commande (pg_dump ou mysqldump)
      await runProcess(command, args, env, dbType, outputSqlPath);

      // 6. Gérer la compression (ou non)
      if (compression) {
        // Compresser le .sql puis supprimer le .sql
        await zipFile(outputSqlPath, outputZipPath);
        fs.unlinkSync(outputSqlPath); // Supprime le .sql non compressé

        // Résoudre avec les infos du .zip
        const stats = fs.statSync(outputZipPath);
        resolve({ filePath: outputZipPath, fileSize: stats.size });

      } else {
        // Pas de compression, on garde le .sql
        const stats = fs.statSync(outputSqlPath);
        resolve({ filePath: outputSqlPath, fileSize: stats.size });
      }

    } catch (error) {
      // En cas d'erreur, s'assure qu'on ne laisse pas de fichiers orphelins
      if (fs.existsSync(outputSqlPath)) fs.unlinkSync(outputSqlPath);
      if (fs.existsSync(outputZipPath)) fs.unlinkSync(outputZipPath);
      reject(error);
    }
  });
}

/**
 * Fonction utilitaire pour exécuter un processus enfant (spawn).
 */
function runProcess(command, args, env, dbType, outputSqlPath) {
  return new Promise((resolve, reject) => {
    console.log(`[Backup] Démarrage: ${command} ${args.join(' ')}`);
    
    // Pour mysqldump, nous devons capturer stdout
    const fileStream = (dbType === 'mysql') 
      ? fs.createWriteStream(outputSqlPath) 
      : null;

    const process = spawn(command, args, { env });

    if (dbType === 'mysql') {
      process.stdout.pipe(fileStream); // Redirige la sortie du dump vers le fichier
    }

    let errorOutput = '';
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`[Backup] Succès: ${command}`);
        resolve();
      } else {
        console.error(`[Backup] Échec (Code: ${code}): ${errorOutput}`);
        reject(new Error(errorOutput || `La commande ${command} a échoué`));
      }
    });

    process.on('error', (err) => {
      console.error(`[Backup] Erreur Spawn: ${err.message}`);
      reject(err);
    });
  });
}

/**
 * Fonction utilitaire pour zipper un fichier.
 */
function zipFile(sourcePath, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`[Archive] Compression terminée: ${outputPath}`);
      resolve();
    });

    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.file(sourcePath, { name: path.basename(sourcePath) });
    archive.finalize();
  });
}

module.exports = { executeBackup };