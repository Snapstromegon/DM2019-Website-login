const rpn = require('request-promise-native');
const { JSDOM } = require('jsdom');

module.exports = class Session {
  /**
   *
   * @param {Object} config
   * @param {{user: String, password: String}} config.credentials
   * @param {String} config.url
   * @param {import('request').CookieJar} config.cookieJar
   */
  constructor({ url, credentials, cookieJar = rpn.jar() } = {}) {
    this.url = url;
    this.credentials = credentials;
    this.cookieJar = cookieJar;
  }

  async login() {
    const dom = new JSDOM(
      await this.get({
        url: `${this.url}/users/sign_in`
      })
    );

    const authToken = dom.window.document.querySelector(
      'input[name="authenticity_token"]'
    ).value;

    await this.post({
      followAllRedirects: true,
      url: `${this.url}/users/sign_in`,
      form: {
        authenticity_token: authToken,
        'user[email]': this.credentials.user,
        'user[password]': this.credentials.password
      }
    });
  }

  get(...options) {
    if (typeof options[0] === 'string') {
      options[0] = { url: options[0] };
    }
    return rpn.get(
      {
        jar: this.cookieJar,
        strictSSL: false,
        ...options[0]
      },
      ...options.slice(1)
    );
  }

  post(...options) {
    return rpn.post(
      {
        jar: this.cookieJar,
        strictSSL: false,
        ...options[0]
      },
      ...options.slice(1)
    );
  }
};
