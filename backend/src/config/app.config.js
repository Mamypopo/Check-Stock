import dotenv from 'dotenv';

dotenv.config();

const checkEnvVariable = (key) => {
    if (process.env[key]) {
        return process.env[key];
    }
    throw new Error(`Environment variable ${key} not found`);
}

const appConfig = {
    port: checkEnvVariable('PORT'),
    databaseUrl: checkEnvVariable('DATABASE_URL')
};

export default appConfig;