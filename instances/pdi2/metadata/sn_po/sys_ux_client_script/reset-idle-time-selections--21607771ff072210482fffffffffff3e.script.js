/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { idleTimeConfiguration } = api.state;
    const newFields = idleTimeConfiguration.fields.map(field => (
        {
        ...field,
        checked: false,
    }
    )); 
    api.setState('idleTimeConfiguration', { ...idleTimeConfiguration, fields: newFields });
}
