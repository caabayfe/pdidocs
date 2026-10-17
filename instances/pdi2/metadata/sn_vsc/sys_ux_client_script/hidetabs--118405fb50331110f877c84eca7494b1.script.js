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
    if (api.context.session.user.roles.includes('sn_vsc.security_center_viewer')) {
        api.data.gform.hideRelatedList({
            listTableName: 'REL:7209ce9dffc31010dbaed66cf43bf166'
        });
    }
}
