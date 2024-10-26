// Global constants
export const CHATS = [785206267, 5532327751];

export const ENV_NAMES = {
  DB_URL: 'DB_URL',
  TELEGRAM_BOT_TOKEN: 'TELEGRAM_BOT_TOKEN',
  TELEGRAM_BOT_USERNAME: 'TELEGRAM_BOT_USERNAME',
  ADMIN_USERNAME: 'ADMIN_USERNAME',
  DEVELOPER_USERNAME: 'DEVELOPER_USERNAME',
  TELEGRAM_BOT_CURRENCY: 'TELEGRAM_BOT_CURRENCY',
  REWARD_FOR_A_FRIEND: 'REWARD_FOR_A_FRIEND',
  MIN_WITHDRAWAL_AMOUNT: 'MIN_WITHDRAWAL_AMOUNT',
  NODE_ENV: 'NODE_ENV',
  ENV_PATH: (mode?: 'development' | 'production' | 'test' | string) => {
    if (!mode) return '.env';
    return `.env.${mode}`;
  },
  PORT: 'PORT',
  SECRET_KEY: 'SECRET_KEY',
  JWT_EXPIRES: 'JWT_EXPIRES',
  JWT_ACCESS_KEY: 'JWT_ACCESS_KEY',
  JWT_REFRESH_KEY: 'JWT_REFRESH_KEY',
  SMTP_HOST: 'SMTP_HOST',
  SMTP_PORT: 'SMTP_PORT',
  SMTP_USER: 'SMTP_USER',
  SMTP_PASS: 'SMTP_PASS',
  ADMIN_ID: 'ADMIN_ID',
  SERVER_URL: 'SERVER_URL',
  CLIENT_URL: 'CLIENT_URL',
};

export const DEFAULT_CURRENCY =
  process.env[ENV_NAMES.TELEGRAM_BOT_CURRENCY] || 'USDT';
export const DEFAULT_REWARD_FOR_A_FRIEND =
  +process.env[ENV_NAMES.REWARD_FOR_A_FRIEND] || 0.02;
export const DEFAULT_TELEGRAM_BOT_USERNAME =
  process.env[ENV_NAMES.TELEGRAM_BOT_USERNAME];
export const DEFAULT_TELEGRAM_DEVELOPER_USERNAME =
  process.env[ENV_NAMES.DEVELOPER_USERNAME];
export const DEFAULT_ADMIN_USERNAME = process.env[ENV_NAMES.ADMIN_USERNAME];
export const TELEGRAM_BOT_USERNAME =
  process.env[ENV_NAMES.TELEGRAM_BOT_USERNAME];
export const MIN_WITHDRAWAL_AMOUNT =
  +process.env[ENV_NAMES.MIN_WITHDRAWAL_AMOUNT];
