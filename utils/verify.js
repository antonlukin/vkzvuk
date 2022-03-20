const md5 = require('md5');

/**
 * Verify VK Open API user data.
 * We don't care that the token expired.
 *
 * @param {Object} params List body query params
 * @param {String} signature Empty string to concat signature
 * @return {null|String}
 */
module.exports = (params, signature = '') => {
  const required = ['expire', 'mid', 'secret', 'sid'];

  for (let i = 0; i < required.length; i++) {
    const key = required[i];

    if (!params[key]) {
      return null;
    }

    signature = signature + key + '=' + params[key];
  }

  const secret = process.env.VK_SHARED_SECRET || '';

  if (params.sig !== md5(signature + secret)) {
    return null;
  }

  return params.mid;
};
