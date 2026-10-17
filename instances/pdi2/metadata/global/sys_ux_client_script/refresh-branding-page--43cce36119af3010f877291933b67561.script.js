/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.gform) {
        let gFormData = api.data.gform.nowRecordFormBlob;
        if (gFormData && gFormData.isNewRecord) {
            var _props = api.context.props;
            const {
                navigateTo
            } = imports["global.CiRoutingUtils"]();
            navigateTo(api, {
                route: 'branding-settings',
                fields: {
                    'sysId': gFormData.sysId
                },
                params: {
                    't': Date.now()
                }
            });
        }
    }
}
