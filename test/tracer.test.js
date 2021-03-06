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
const path = require('path');
const tracer = require('../src/vcl/tracer');
const { include } = require('../src/fastly/include-util');

const before = `
sub vcl_fake {
  # synthetic response for Static-302: creates a redirect to the immutable URL
  if (obj.status == 902 && req.http.X-Location) {
    set obj.http.Content-Type = "text/html";
    set obj.status = 302;
    set obj.http.Location = req.http.X-Location;
    synthetic "Found: <a href='" + req.http.X-Location+ "'>" + req.http.X-Location + "</a>";
    return(deliver);
  }
  call hlx_error_errors;
}
`;

describe('Tracer Integration Test', () => {
  it('Trace Statements gets Injected', () => {
    const result = tracer(before, {
      serviceId: 'fake-id',
      loggerName: 'epsagon-https',
      epsagonToken: 'fake-token',
    });
    // console.log(result);
    const results = result.match(/log {"syslog fake-id epsagon-https :: "}/g);
    assert.equal(results.length, 4);
    // eslint-disable-next-line no-console
    console.log(result);
  });

  it('Trace Statements get injected into helix.vcl', () => {
    const result = include(path.resolve(__dirname, '../layouts/fastly/helix.vcl'), tracer, {
      serviceId: 'fake-id',
      loggerName: 'helix-epsagon',
      epsagonToken: 'fake-token',
    });
    assert.ok(result);
    // just don't throw
    // eslint-disable-next-line no-console
    console.log(result);
  });
});
