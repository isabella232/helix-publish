/*
 * Copyright 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const { HelixConfig } = require('@adobe/helix-shared');
const initfastly = require('@adobe/fastly-native-promises');
const backends = require('./fastly/backends');
const vcl = require('./fastly/vcl');
const dictionaries = require('./fastly/dictionaries');

/* eslint-disable no-console */
async function publish(configuration, service, token, version) {
  const config = await new HelixConfig().withJSON(configuration).init();
  const fastly = await initfastly(token, service);

  console.log('publishing …');

  return Promise.all([
    backends.init(fastly, version),
    backends.updatestrains(fastly, version, config.strains),
    vcl.init(fastly, version),
    vcl.updatestrains(fastly, version, config.strains),
    dictionaries.init(
      fastly,
      version,
    ).then(() => dictionaries.updatestrains(
      fastly,
      version,
      config.strains,
    )),
  ]).then((tasks) => {
    console.log('success…');
    return {
      body: {
        status: true,
        completed: tasks.length,
      },
    };
  }).catch((e) => {
    console.error(e);
    return {
      statusCode: 500,
      body: `Unknown error: ${e}`,
    };
  });
}

module.exports = publish;
