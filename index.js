require('./utils/configLoader.js')({ configPath: __dirname+'/config.json' });

const app = require('./app/app.js');
const db = require('./db/db.js');
const IufTool = require('./iufTool/IufTool.js');
const iufDbSyncer = require('./utils/syncIufToDB.js');

async function main() {
  console.log('🕐 Syncing DB Models');
  const dbConnection = await db({
    database: config.db.database,
    username: config.db.credentials.user,
    password: config.db.credentials.password,
    host: config.db.host,
    dialect: config.db.dialect,
    logging: config.db.logging
  });
  console.log('✔️ DB Models are Synced');

  console.log('🕐 Connecting to IUF Tool');
  try{

    const iufTool = new IufTool({
      credentials: { user: config.secrets.iufTool.user, password: config.secrets.iufTool.password }
    });
    await iufTool.loggedInPromise;
    console.log('✔️ Connected to IUF Tool');
    
    console.log('🕐 Syncing IUF Tool User Base');
    iufDbSyncer.keepIufAndDbInSync(iufTool, {
      updateInterval: config.sync.updateInterval
    });
    console.log('✔️ Syncing IUF Tool User Base');
  } catch (err){
    console.error("❌ Connection to IUF Failed", err);
  }

  console.log('🕐 Starting app');
  app({ port: config.express.port,db: dbConnection });
  console.log('✔️ Started app');
}

main();
