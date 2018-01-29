import log4js from 'log4js'
import config from 'config'

const defaultAppenders = [
  "everything",
]

const errorAppenders = [
  "everything", "error"
]

if (process.env.NODE_ENV !== "test") {
  defaultAppenders.push("console");
  errorAppenders.push("console");
}

log4js.configure({
  appenders: {
    console: {
      type: "console"
    },
    everything: {
      type: "file",
      filename: "logs/everything.log",
      maxLogSize: 10485760,
      backups: 7
    },
    error: {
      type: 'file',
      filename: 'logs/error.log',
      maxLogSize: 10485760,
      backups: 7
    }
  },
  categories: {
    default: {
      appenders: defaultAppenders,
      level: 'info'
    },
    error: {
      appenders: errorAppenders,
      level: 'error'
    },
    debug: {
      appenders: ["console"],
      level: "debug"
    }
  }
})

const getLogger = function(category) {
  const logger = log4js.getLogger(category)
  logger.level = config.get("logger.level")
  return logger
}

const Logger = new (function() {
  this.info = function(...args) {
    getLogger().info.apply(getLogger(), args)
    return this;
  }

  this.trace = function(...args) {
    getLogger("debug").trace.apply(getLogger("debug"), args)
    return this;
  }

  this.debug = function(...args) {
    getLogger("debug").debug.apply(getLogger("debug"), args)
    return this;
  }

  this.error = function(...args) {
    getLogger("error").error.apply(getLogger("error"), args)
    return this;
  }

  this.fatal = function(...args) {
    getLogger("error").fatal.apply(getLogger("error"), args)
    return this;
  }

  return this;
});

export default Logger