import dotenv from 'dotenv';
import path from 'path';

async function globalSetup() {
  dotenv.config({
    path: path.resolve(process.cwd(), '.env.local'),
    override: true
  });
}

export default globalSetup;
