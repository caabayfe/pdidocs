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
    if (!event.payload.item.tableName && api.state.sourceType !== 'PLAYBOOK_DATA') {
        api.setState('noDataMessage', {});
        api.setState('selectedSourceValue', '');
        api.setState('projectDetails', {...api.state.projectDetails,source:''});
        api.data.list_controller.updateQuery({
            encodedQuery: api.state.templateListFixedQuery,
        });
        return;
    }
    api.setState('projectDetails', {...api.state.projectDetails,source:event.payload.item.label});
    if (api.state.sourceType == 'PLAYBOOK_DATA' && event.payload.item.id) {
        // fixed primary table for playbook source
        api.setState('selectedSourceValue', 'sys_pd_context');
        api.setState('selectedDataSourceID', event.payload.item.id);
    } else {
        api.setState('selectedSourceValue', event.payload.item.tableName);
    }
    api.setState('selectedSourceLabel', event.payload.item.label);
    if (api.state.sourceType == 'EXTERNAL_DATA') {
        api.setState('selectedDataSourceID', event.payload.item.id);
    } else if (api.state.sourceType == 'REPORT_SOURCE') {
        api.setState('selectedDataSourceID', event.payload.item.id);
    } else if(event.payload.item.label != "" && event.payload.item.label!=api.state.selectedSourceLabel ){
        api.setState('listFilterQuery', `parent_entityISEMPTY^table=${event.payload.item.tableName}^project.is_template=true^ORproject.content_pack=true`);
    }
    if (event.payload.item.tableName) {
        // get table process configurations get_process_configuration
        api.data.get_process_configuration.execute({
            table: event.payload.item.tableName
        });
        api.setState('isSourceInvalid', false);
    }
}
