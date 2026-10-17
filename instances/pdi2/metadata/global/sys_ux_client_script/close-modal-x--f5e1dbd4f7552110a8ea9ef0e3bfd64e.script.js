/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var wizardId = api.context.props.sysId;
    var recordId = api.context.props.recordId;

    api.emit('NAV_ITEM_SELECTED', {
        external: {
            'url': '/now/configuration/iar/wizard/' + wizardId + '/params/record-id/' + recordId,
            'target': '_self'
        }
    });
}
