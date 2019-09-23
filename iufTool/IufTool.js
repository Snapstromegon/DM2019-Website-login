const Session = require('./Session.js');
const { JSDOM } = require('jsdom');

/**
 * @typedef {{iufId: Number, name: string, club:string, type:string}} IufRegistrant
 */

module.exports = class IufTool {
  /**
   * The IufTool class provides an interface to the IUF registration tool
   * @param {Object} config
   * @param {{Registrant: String, password: String}} config.credentials
   * @param {String} config.url
   */
  constructor({
    credentials,
    url = 'https://anmeldung.freestyledm2019.de'
  } = {}) {
    this.url = url;
    this.session = new Session({ credentials, url });
    this.loggedInPromise = this.session.login();
  }

  /**
   * Gets a list of all Registrants excluding accessCodes
   * @returns {Promise<Array<IufRegistrant>>} All Registrants registered in the IUF tool
   */
  async getAllRegistrants() {
    await this.loggedInPromise;

    const response = await this.session.get(`${this.url}/registrants/all`);
    const dom = new JSDOM(response);
    const document = dom.window.document;
    const rows = document.querySelectorAll('table tbody tr');
    const Registrants = [];
    for (const row of rows) {
      const tds = row.querySelectorAll('td');
      Registrants.push({
        iufId: parseInt(tds[0].innerHTML),
        name: tds[1].innerHTML,
        type: tds[2].innerHTML,
        club: tds[3].innerHTML
      });
    }
    return Registrants;
  }

  /**
   * Gets the AccessCode of a single registrant
   * @param {IufRegistrant} search Registrant to get the accessCode of
   */
  async getRegistrantAccessCode({ iufId }) {
    await this.loggedInPromise;
    const response = await this.session.get(`${this.url}/registrants/${iufId}`);
    return new JSDOM(response).window.document
      .querySelector('.access_code')
      .innerHTML.split('<b>')[0]
      .trim();
  }
};
