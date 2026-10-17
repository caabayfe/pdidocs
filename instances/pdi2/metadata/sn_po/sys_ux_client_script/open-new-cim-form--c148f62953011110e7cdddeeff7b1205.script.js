/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    const {
        projectId: modelDefinitionId,
        domain
    } = api.context.props.modelDefinition;
    const {
        getNewCIMFormPayload
    } = imports["global.prominUtils"]();

    api.emit("NAV_ITEM_SELECTED", getNewCIMFormPayload({
        modelDefinitionId,
        domain
    }));
}
