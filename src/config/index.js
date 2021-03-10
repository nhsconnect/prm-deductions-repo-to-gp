import databaseConfig from './database';

export const portNumber = 3000;

export const initializeConfig = () => ({
  nhsEnvironment: process.env.NHS_ENVIRONMENT || 'local',
  repoToGpServiceUrl: process.env.SERVICE_URL || `http://127.0.0.1:${portNumber}`,
  repoToGpAuthKeys: process.env.AUTHORIZATION_KEYS || 'auth-key-1',
  gp2gpAdaptorServiceUrl: process.env.GP2GP_ADAPTOR_SERVICE_URL,
  gp2gpAdaptorAuthKeys: process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS || 'auth-key-1',
  ehrRepoServiceUrl: process.env.EHR_REPO_SERVICE_URL,
  ehrRepoAuthKeys: process.env.EHR_REPO_AUTHORIZATION_KEYS || 'auth-key-1',
  sequelize: databaseConfig
});
