
import {Provider, bind, inject} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {RecommenderDataSource} from '../datasources/recommender.datasource';
import {RecommenderService, recommender} from './recommender.service';

/**
 * Rest based recommender service
 */
@bind(recommender('rest'))
export class RecommenderRestServiceProvider
  implements Provider<RecommenderService> {
  constructor(
    @inject('datasources.recommender')
    protected datasource: RecommenderDataSource,
  ) { }

  value(): Promise<RecommenderService> {
    return getService(this.datasource);
  }
}
