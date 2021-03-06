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

function init(fastly, version, name, token) {
  return fastly.writeHttps(version, name, {
    name,
    format: '', // empty string as regular value
    url: 'https://fastly.epsagon.com/logs',
    request_max_entries: 20,
    content_type: 'application/json',
    method: 'POST',
    header_name: 'x-epsagon-token',
    header_value: token,
  });
}

module.exports = { init };
