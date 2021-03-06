import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import { initializeConfig } from '../../src/config';

describe('/health', () => {
  const config = initializeConfig();
  const healthUrl = `${config.repoToGpServiceUrl}/health`;

  it('should return 200', async () => {
    const res = await axios.get(healthUrl, { adapter });
    expect(res.status).toEqual(200);
  });

  it('health endpoint returns matching data', async () => {
    const res = await axios.get(healthUrl, { adapter });
    const expectedRes = {
      version: '1',
      description: 'Health of Repo To GP service',
      nhsEnvironment: config.nhsEnvironment,
      details: {
        database: {
          type: 'postgresql',
          connection: true,
          writable: true
        }
      }
    };

    expect(res.data).toEqual(expectedRes);
  });
});
