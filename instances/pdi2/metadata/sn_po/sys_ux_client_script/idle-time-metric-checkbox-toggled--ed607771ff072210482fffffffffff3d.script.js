/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const { idleTimeConfiguration } = api.state;
    const newFields = idleTimeConfiguration.fields.map(item => {
        if (item.name === event.payload.itemId) {
            item.checked = event.payload.checked;
        }
        return item;
    });

    api.setState('idleTimeConfiguration', { ...idleTimeConfiguration, fields: newFields });
}
