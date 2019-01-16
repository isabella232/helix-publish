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
const fs = require('fs-extra');
const assert = require('assert');
const path = require('path');
const { HelixConfig } = require('@adobe/helix-shared');
const utils = require('../src/fastly/vcl-utils');
const { backends } = require('../src/fastly/backends');

/* eslint-env mocha */

describe('Testing vcl-utils.js', () => {
  it('#regexp', () => {
    assert.equal(utils.regexp([]), '');
    assert.equal(utils.regexp(['foo*']), '^foo.*$');
    assert.equal(utils.regexp(['foo*', '*bar']), '^foo.*$|^.*bar$');
  });

  function resolvetest(name) {
    return async function test() {
      const config = await new HelixConfig()
        .withConfigPath(path.resolve(__dirname, `fixtures/${name}.yaml`))
        .init();

      const expected = fs.readFileSync(path.resolve(__dirname, `fixtures/${name}-resolve.vcl`)).toString();

      const vcl = utils.resolve(config.strains);
      assert.equal(vcl, expected);
    };
  }

  function resettest(name) {
    return async function test() {
      const config = await new HelixConfig()
        .withConfigPath(path.resolve(__dirname, `fixtures/${name}.yaml`))
        .init();

      const expected = fs.readFileSync(path.resolve(__dirname, `fixtures/${name}-reset.vcl`)).toString();

      const vcl = utils.reset([
        ...Object.values(backends),
        ...config.strains.getProxyStrains().map(strain => strain.origin)]);
      assert.equal(vcl, expected);
    };
  }

  function parameterstest(name) {
    return async function test() {
      const config = await new HelixConfig()
        .withConfigPath(path.resolve(__dirname, `fixtures/${name}.yaml`))
        .init();

      const expected = fs.readFileSync(path.resolve(__dirname, `fixtures/${name}-params.vcl`)).toString();

      const vcl = utils.parameters(config.strains);
      assert.equal(vcl, expected);
    };
  }

  it('#resolve/full', resolvetest('full'));
  it('#reset/full', resettest('full'));
  it('#parameters/full', parameterstest('full'));
});
