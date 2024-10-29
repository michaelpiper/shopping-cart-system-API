

import {inject, lifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {AnyObject, juggler} from '@loopback/repository';
const {REDIS_PORT, REDIS_HOST, REDIS_PASSWORD} = process.env
const config = {
  name: 'redis',
  connector: 'kv-redis',
  host: REDIS_HOST ?? '127.0.0.1',
  port: REDIS_PORT ? +REDIS_PORT : 6379,
  password: REDIS_PASSWORD ?? '',
  db: 0,
};

function updateConfig(dsConfig: AnyObject) {
  if (process.env.KUBERNETES_SERVICE_HOST) {
    dsConfig.host = process.env.SHOPPING_APP_REDIS_MASTER_SERVICE_HOST;
    dsConfig.port = +process.env.SHOPPING_APP_REDIS_MASTER_SERVICE_PORT!;
  }
  return dsConfig;
}

@lifeCycleObserver('datasource')
export class RedisDataSource extends juggler.DataSource {
  static readonly dataSourceName = config.name;
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.redis', {optional: true})
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
