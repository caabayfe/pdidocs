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

    const {
        projectId,
    } = api.context.props.modelDefinition;
    const {
        getNewCOEFormPayload
    } = imports["global.prominUtils"]();

    api.emit("NAV_ITEM_SELECTED", getNewCOEFormPayload({
        sourceRecord: projectId,
        sourceTable: "promin_project"
    }));
}
