const User = require('../db/models/User.js');
const Registrant = require('../db/models/Registrant.js');

async function syncIufToDb(iufTool) {
  const iufRegistrants = await iufTool.getAllRegistrants();

  for (const iufRegistrant of iufRegistrants) {
    if (
      (await Registrant.count({ where: { iufId: iufRegistrant.iufId } })) === 0
    ) {
      const user = (await User.findOrCreate({
        where: { name: iufRegistrant.name },
        defaults: {
          password: await iufTool.getRegistrantAccessCode(iufRegistrant)
        }
      }))[0];
      await user.save();
      const registrant = new Registrant({
        iufId: iufRegistrant.iufId,
        type: iufRegistrant.type,
        club: iufRegistrant.club
      });
      await registrant.save();
      registrant.setUser(user);
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
};
