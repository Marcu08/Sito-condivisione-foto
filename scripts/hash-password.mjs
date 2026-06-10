import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Uso: npm run hash-password -- laTuaPassword');
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, 12);
  console.log(hash);
} catch (err) {
  console.error('Errore durante la generazione dell\'hash:', err.message);
  process.exit(1);
}
