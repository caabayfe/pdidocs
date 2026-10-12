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
    const project = api.context.props.modelDefinition;
    const {
        getWindowObject
    } = imports["global.prominUtils"]();

    getWindowObject().open(`/nav_to.do?uri=%2Fpromin_project.do%3Fsys_id%3D${project.projectId}`);
}
