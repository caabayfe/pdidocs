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
    api.setState('sourceDataInputValues', []);
    api.setState('projectDetails', {...api.state.projectDetails,source:''});
    api.setState('selectedSourceLabel', '');
    api.setState('noDataMessage', {});
    api.setState('isSourceDataLoaderDisabled', false);
    api.data.list_controller.updateQuery({
        encodedQuery: api.state.templateListFixedQuery,
    });
    if (event.payload.item.id === 'TABLE') {
        api.setState('hideTemplateList', false);
        api.setState('tableNameFetchInput', '');
    } else if (event.payload.item.id === 'EXTERNAL_DATA') {
        api.setState('hideTemplateList', true);
        api.setState('tableNameFetchInput', 'sn_po_extdata_dataset?sysparm_query=state=READY^case_tableISNOTEMPTY');
    } else if (event.payload.item.id === 'REPORT_SOURCE') {
        api.setState('hideTemplateList', true);
        api.setState('tableNameFetchInput', 'sys_report_source');
    } else if (event.payload.item.id === 'AGENTIC_AI_DATA') {
        api.setState('hideTemplateList', false);
        api.setState('tableNameFetchInput', '');
    } else if (event.payload.item.label == 'Archived data') {
        api.setState('hideTemplateList', false);
        api.setState('tableNameFetchInput', '');
    } else if (event.payload.item.id === 'PLAYBOOK_DATA') {
        api.setState('hideTemplateList', true);
        api.setState('tableNameFetchInput', 'sys_pd_process_definition?sysparm_query=active=true^ORDERBYDESCsys_updated_on');
    } else {
        api.setState('hideTemplateList', false);
        api.setState('tableNameFetchInput', '');
    }
}
