const jetpack = require('fs-jetpack')
const Plugin = require('../domain/plugin')
const loadCommandFromFile = require('./command-loader')
const loadExtensionFromFile = require('./extension-loader')
const { isNotDirectory } = require('../utils/filesystem-utils')
const { isBlank } = require('../utils/string-utils')
const { concat, map } = require('ramda')
const toml = require('toml')

/**
 * Loads a plugin from a directory.
 *
 * @param {string} directory The full path to the directory to load.
 * @param {{}}     options   Additional options to customize the loading process.
 */
function loadFromDirectory (directory, options = {}) {
  const plugin = new Plugin()

  const key = options.key || 'gluegun'
  const commandFilePattern = options.commandFilePattern || 'commands/*.js'
  const extensionFilePattern = options.extensionFilePattern || 'extensions/*.js'
  const namespace = options.namespace
  if (!isBlank(namespace)) {
    plugin.namespace = namespace
  }

  // sanity check the input
  if (isBlank(directory)) {
    plugin.loadState = 'error'
    plugin.errorState = 'input'
    return plugin
  }

  // directory check
  if (isNotDirectory(directory)) {
    plugin.loadState = 'error'
    plugin.errorState = 'missingdir'
    return plugin
  }

  plugin.directory = directory

  // the directory is the default namespace (unless we were told what it was)
  if (isBlank(namespace)) {
    plugin.namespace = jetpack.inspect(directory).name
  }

  // load the commands found in the commands sub-directory
  plugin.commands = map(
    file => loadCommandFromFile(`${directory}/${file}`),
    jetpack.cwd(plugin.directory).find({ matching: commandFilePattern })
    )

  // load the commands found in the commands sub-directory
  plugin.extensions = map(
    file => loadExtensionFromFile(`${directory}/${file}`),
    jetpack.cwd(plugin.directory).find({ matching: extensionFilePattern })
    )

  // if we have a config toml
  try {
    // attempt to load the toml file
    const tomlFile = `${directory}/${key}.toml`

    // read it
    const config = toml.parse(jetpack.read(tomlFile))

    // set the namespace if we have one (unless we were told what it was)
    if (isBlank(namespace)) {
      plugin.namespace = config.namespace || plugin.namespace
    }
    plugin.defaults = config.defaults || {}

    // also load commands located in the commands key
    const commandsFromConfig = map(
      config => {
        const { name, file, description } = config
        const command = loadCommandFromFile(`${directory}/${file}`)
        command.name = name
        command.description = description
        return command
      },
      config.commands || []
      )

    // add our commands to the list
    plugin.commands = concat(commandsFromConfig, plugin.commands)
  } catch (e) {
    // no worries, configs are optional
  }

  // we are good!
  plugin.loadState = 'ok'
  plugin.errorState = 'none'

  return plugin
}

module.exports = loadFromDirectory