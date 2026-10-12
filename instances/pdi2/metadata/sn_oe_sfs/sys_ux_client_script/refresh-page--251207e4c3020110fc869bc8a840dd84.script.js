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
    if (api.data.gform) {
        let gFormData = api.data.gform.nowRecordFormBlob;
        if (gFormData && gFormData.isNewRecord) {
            var _props = api.context.props;
            const {
                navigateTo
            } = imports["sn_oe_sfs.CiNavigationUtils"]();
            navigateTo(api, {
                route: 'record',
                fields: {
                    'table': _props.table,
                    'sysId': gFormData.sysId
                },
                params: {
                    't': Date.now()
                }
            });
        }
    }
}
