import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(__dirname, '../../logs');

if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

const streams = {
  error: createWriteStream(join(LOG_DIR, 'error.log'), { flags: 'a' }),
  warn: createWriteStream(join(LOG_DIR, 'warn.log'), { flags: 'a' }),
  info: createWriteStream(join(LOG_DIR, 'info.log'), { flags: 'a' }),
  debug: createWriteStream(join(LOG_DIR, 'debug.log'), { flags: 'a' }),
};

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = process.env.LOG_LEVEL || 'info';

function formatTimestamp() {
  return new Date().toISOString();
}

function shouldLog(level) {
  return levels[level] <= levels[currentLevel];
}

function write(level, msg, meta = {}) {
  if (!shouldLog(level)) return;
  const entry = JSON.stringify({ level, timestamp: formatTimestamp(), message: msg, requestId: meta.requestId || null, ...meta }) + '\n';
  if (streams[level]) streams[level].write(entry);
  if (level === 'error' || level === 'warn') process.stderr.write(entry);
  else process.stdout.write(entry);
}

process.on('exit', () => {
  for (const s of Object.values(streams)) s.end();
});

const logger = {
  error: (msg, meta = {}) => write('error', msg, meta),
  warn: (msg, meta = {}) => write('warn', msg, meta),
  info: (msg, meta = {}) => write('info', msg, meta),
  debug: (msg, meta = {}) => write('debug', msg, meta),
};

export default logger;
