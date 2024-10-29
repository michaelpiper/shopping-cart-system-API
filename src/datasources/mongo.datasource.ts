
import {inject, lifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {AnyObject, juggler} from '@loopback/repository';
const {DATABASE_PORT, DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME} = process.env
const config = {
  name: 'mongo',
  connector: 'mongodb',
  url: process.env.DATABASE_URL ?? '',
  host: DATABASE_HOST ?? '127.0.0.1',
  port: DATABASE_PORT ? +DATABASE_PORT : 27017,
  user: DATABASE_USER ?? '',
  password: DATABASE_PASSWORD ?? '',
  database: DATABASE_NAME ?? '',
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

function updateConfig(dsConfig: AnyObject) {
  if (process.env.KUBERNETES_SERVICE_HOST) {
    dsConfig.host = process.env.SHOPPING_APP_MONGODB_SERVICE_HOST;
    dsConfig.port = +process.env.SHOPPING_APP_MONGODB_SERVICE_PORT!;
  }
  return dsConfig;
}

@lifeCycleObserver('datasource')
export class MongoDataSource extends juggler.DataSource {
  static readonly dataSourceName = config.name;
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongo', {optional: true})
    dsConfig: AnyObject = config,
  ) {
    super(updateConfig(dsConfig));
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}
