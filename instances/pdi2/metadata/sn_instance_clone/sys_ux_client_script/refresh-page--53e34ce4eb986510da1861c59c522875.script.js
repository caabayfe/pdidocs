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
                navigateToPage
            } = imports["sn_instance_clone.InstanceCloneUtils"]();
            navigateToPage(api,
                'record', {
                    'table': _props.table,
                    'sysId': gFormData.sysId
                }, {
                    view: 'clone_ui',
                    aceNav: api.context.props.aceNav,
                    't': Date.now()
                }
            );
        }
    }
}
