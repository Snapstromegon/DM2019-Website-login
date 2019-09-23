const Registrant = require('../db/models/Registrant.js');

async function syncIufToDb(iufTool) {
  const iufRegistrants = await iufTool.getAllRegistrants();

  for (const iufRegistrant of iufRegistrants) {
    if (
      (await Registrant.count({ where: { iufId: iufRegistrant.iufId } })) === 0
    ) {
      const registrant = new Registrant({
        ...iufRegistrant,
        accessCode: await iufTool.getRegistrantAccessCode(iufRegistrant)
      });
      await registrant.save();
    }
  }
}

async function keepIufAndDbInSync(iufTool, { updateInterval }) {
  await syncIufToDb(iufTool);
  setInterval(() => syncIufToDb(iufTool), updateInterval);
}

module.exports = {
  syncIufToolToDb: syncIufToDb,
  keepIufAndDbInSync
}