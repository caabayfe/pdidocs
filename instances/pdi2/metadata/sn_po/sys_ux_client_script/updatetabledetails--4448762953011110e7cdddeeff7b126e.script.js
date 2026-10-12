/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        getRootModel,
    } = imports["global.prominUtils"]();
    const projectEntities = api.data.fetch_table_details.output.data.GlidePromin_Query.version.projectDefinition.projectEntities;
    const { rootEntity } = getRootModel({projectEntities});
    api.setState('table', rootEntity.table);
}
