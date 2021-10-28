// internal
const OD_COMMAND_PREFIX = 'octopusDeploy';

// general
export const EXTENSION_ID = 'vscode-octopusdeploy';
export const LANGUAGE_CLIENT_NAME = 'Octopus Deploy for Visual Studio Code';
export const OCL_EXPLORER_ID = 'oclOutline';
export const OCL_LANGUAGE_ID = 'ocl';

// user settings
export const EXTENSION_CONFIGURATION_KEY = 'octopus';

// commands
export const SETUP_API_KEY_CMD = `${OD_COMMAND_PREFIX}.setupApiKey`;
export const OCL_OUTLINE_REFRESH_ENTRY_CMD = `${OCL_EXPLORER_ID}.refreshEntry`;
export const OCL_OUTLINE_ADD_ENTRY_CMD = `${OCL_EXPLORER_ID}.addEntry`;
export const OPEN_TO_POSITION_CMD = `${OD_COMMAND_PREFIX}.openToPosition`;

// stored keys
export const API_KEY_SECRET = 'api-key';

// messages
export const API_KEY_REQUIRED_MSG = 'It is recommended that you set the API key to your Octopus Deploy instance for the best experience.';
export const API_KEY_SET_MSG = 'API key for Octopus Deploy successfully set.';
export const CLEAR_API_KEY_MSG = 'Do you wish to clear the API key for Octopus Deploy?';
export const CHECK_OCTOPUS_DOC_MSG = 'Check the Octopus Deploy documentation';
export const SET_API_KEY_NOW_MSG = 'Set the API key for your Octopus Deploy instance';

// placeholders
export const TYPE_API_KEY_PLACEHOLDER = 'Type the API key to your Octopus Deploy instance';

// links
export const HOW_TO_CREATE_AN_API_KEY_URL = 'https://octopus.com/docs/octopus-rest-api/how-to-create-an-api-key';