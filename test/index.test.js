/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env mocha */
process.env.HELIX_FETCH_FORCE_HTTP1 = 'true';

const assert = require('assert');
const { reportError } = require('../src/publish');

describe('Error reporting tests', () => {
  it('Reports generic errors as 500', () => {
    try {
      throw new Error();
    } catch (error) {
      const res = reportError(error);
      assert.equal(res.statusCode, 500);
    }
  });

  it('Reports timeout errors as 504', () => {
    try {
      const e = new Error();
      e.cause = {
        code: 'ESOCKETTIMEDOUT',
      };
      throw e;
    } catch (error) {
      const res = reportError(error);
      assert.equal(res.statusCode, 504);
    }
  });
});
