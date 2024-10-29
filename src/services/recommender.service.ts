
import {
  BindingFilter,
  BindingScope,
  BindingTemplate,
  Provider,
  inject,
} from '@loopback/context';
import {extensionFilter, extensionFor} from '@loopback/core';
import {Product} from '../models';

/**
 * Interface for recommendation service
 */
export interface RecommenderService {
  getProductRecommendations(userId: string): Promise<Product[]>;
}

export const RECOMMENDER_SERVICE = 'RecommenderService';

/**
 * A binding template for recommender service extensions
 */
export function recommender(protocol: string) {
  const asRecommenderService: BindingTemplate = binding => {
    extensionFor(RECOMMENDER_SERVICE)(binding);
    binding.tag({protocol}).inScope(BindingScope.SINGLETON);
  };
  return asRecommenderService;
}

const recommenderFilter: BindingFilter = binding => {
  const protocol = 'rest';
  return (
    extensionFilter(RECOMMENDER_SERVICE)(binding) &&
    binding.tagMap.protocol === protocol
  );
};

/**
 * A facade recommender service that selects RESt or gRPC protocol based on
 * the value of `RECOMMENDER_PROTOCOL` environment variable
 */
export class RecommenderServiceProvider
  implements Provider<RecommenderService> {
  constructor(
    @inject(recommenderFilter)
    private recommenderServices: RecommenderService[],
  ) { }

  value() {
    return this.recommenderServices[0];
  }
}
