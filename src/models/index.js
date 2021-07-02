import Sequelize from 'sequelize';
import { initializeConfig } from '../config';
import * as models from './models';
import { Signer } from 'aws-sdk/clients/rds';
import { HttpRequest } from '@aws-sdk/protocol-http'
import { SignatureV4 } from '@aws-sdk/signature-v4'
import { Hash } from '@aws-sdk/hash-node'
import { formatUrl } from '@aws-sdk/util-format-url'
import { defaultProvider } from '@aws-sdk/credential-provider-node';


const timer = ms => new Promise( res => setTimeout(res, ms));
const getAuthToken = hostname => {
  const protocol = 'https';

  const signer = new SignatureV4({
    service: 'rds-db',
    region: 'eu-west-2',
    credentials: defaultProvider,
    sha256: Hash.bind(null, 'sha256')
  });

  const request = new HttpRequest({
    method: 'GET',
    protocol,
    hostname,
    port: '5432',
    query: {
      Action: 'connect',
      DBUser: 'application_user'
    }
  });

  let mango_presigned;

  signer.presign(request, { expiresIn: 900 }).then(presigned => {
    mango_presigned = presigned
    console.log('-----------------------', mango_presigned)
  }).catch(e => console.log('getting presigned url failed', e));

  // while (mango_presigned === undefined) {
  //   timer(3000).then(_=>console.log("done"));
  // }

  // return formatUrl(mango_presigned).replace(`${protocol}://`, '');
};

class ModelFactory {
  constructor() {
    this.db = {};
    this.sequelize = {};
    this.config = initializeConfig().sequelize;
    this._resetConfig();
  }

  _overrideConfig(key, value) {
    this.base_config[key] = value;
    this.configure();
  }

  _resetConfig() {
    this.base_config = this.config;
    this.configure();
  }

  configure() {
    if (this.sequelize instanceof Sequelize) {
      this.sequelize.close();
    }
    console.log(this.base_config.host)

    const token = getAuthToken(this.base_config.host);

    console.log("token", token);

    this.sequelize = new Sequelize(
      this.base_config.database,
      this.base_config.username,
      token,
      this.base_config
    );

    this.sequelize.beforeConnect(config => {
      const tokenn = getAuthToken(this.base_config.host);
      console.log('is this even called?', tokenn);
      config.password = tokenn;
    });

    this.sequelize.authenticate().then(() => console.log('Connection has been established successfully.')).catch((e) => console.error('Unable to connect to the database:', e))

    this.reload_models();
  }

  reload_models() {
    this.db = {};

    for (const m in models) {
      const model = models[m](this.sequelize, Sequelize.DataTypes);
      this.db[model.name] = model;
    }

    Object.keys(this.db).forEach(modelName => {
      if (this.db[modelName].associate) {
        this.db[modelName].associate(this.db);
      }
    });

    this.db.sequelize = this.sequelize;
    this.db.Sequelize = Sequelize;
  }

  getByName(moduleName) {
    return this.db[moduleName];
  }
}

export default new ModelFactory();
