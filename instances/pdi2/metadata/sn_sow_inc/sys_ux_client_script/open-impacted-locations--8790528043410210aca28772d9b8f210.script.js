/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var translatedTitle = await helpers.translate('Impacted locations');
    api.emit("NAV_ITEM_SELECTED", {
        route: "impacted-locations",
        fields: {
            sysId: api.context.props.sysId
        },
        targetRoute: "current",
        title: translatedTitle
    }); 
}
