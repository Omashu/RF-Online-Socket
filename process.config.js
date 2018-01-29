const BABEL_PATH = './node_modules/.bin/babel-node' + (/^win/.test(process.platform) ? '.cmd' : '');

module.exports = {
  apps : [
    {
      name: "rfonline",
      script: "./server/app.js",
      interpreter : BABEL_PATH,
      instance_var : "INSTANCE_ID",
      env : {
        "NODE_ENV" : "production"
      }
    }
  ]
}