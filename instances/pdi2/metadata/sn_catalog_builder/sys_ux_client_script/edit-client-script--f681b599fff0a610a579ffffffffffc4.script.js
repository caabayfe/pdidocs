/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
const fieldProp = api.context.props.field;
    const {payload} = event;
    const {modal} = helpers;

    if (fieldProp && fieldProp.readonly !== 'true') {
            api.setState('clientScriptId', payload.sys_id);
            modal.open('[component-id$="wizard_model"]');
    }
}
