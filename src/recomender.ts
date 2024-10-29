// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-recommender
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
export * from '@loopback/http-server';

import {HttpServer} from '@loopback/http-server';
import express from 'express';
import {ParamsDictionary} from 'express-serve-static-core';

const recommendations = require('../fixtures/recommendations/recommendations.json');
export function createRecommendationServer(
  port = 3001,
  host: string | undefined = undefined,
) {
  const app = express();

  app.get('/:userId', (req: express.Request, res: express.Response) => {
    let userId = (req.params as ParamsDictionary).userId || 'user001';
    if (!(userId in recommendations)) {
      userId = 'user001';
    }
    res.send(recommendations[userId] || []);
  });

  return new HttpServer(app, {port, host});
}

export async function restMain(
  port = 3001,
  host: string | undefined = undefined,
) {
  const server = createRecommendationServer(port, host);
  await server.start();
  console.log('Recommendation REST server is running at ' + server.url + '.');
  return server;
}


export async function main(
  config: {
    rest: {host?: string; port?: number};
  } = {rest: {port: 3001}},
) {
  await restMain(config.rest.port, config.rest.host);
}

if (require.main === module) {
  // Run the application
  main().catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
