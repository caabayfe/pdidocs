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
    if (event.elementId=='getTableDetails' && api.state.tableNameFetchInput === 'goal') {
        let goals = api.data.getTableDetails?.output?.result;
        goals = goals.map(goal => ({
            'id': goal.sys_id,
            'label': goal.short_description
        }));
        api.setState('goals', goals);
    } else if (api.state.tableNameFetchInput.split('?')[0] === 'sn_po_extdata_dataset') {
        let sourceFieldData = api.data.getTableDetails.output.result;
        sourceFieldData = sourceFieldData.map((data) => ({
            'id': data.sys_id,
            'tableName': data.case_table,
            'label': data.name
        }));
        api.setState('sourceDataInputValues', sourceFieldData);
        api.setState('isSourceDataLoaderDisabled', true);
    } else if (api.state.tableNameFetchInput === 'sys_report_source') {
        let sourceFieldData = api.data.getTableDetails.output.result;
        sourceFieldData = sourceFieldData.map((data) => ({
            'id': data.sys_id,
            'tableName': data.table,
            'label': data.display,
            'sublabel': data.table
        }));
        api.setState('sourceDataInputValues', sourceFieldData);
        api.setState('isSourceDataLoaderDisabled', true);
    } else if (api.state.tableNameFetchInput === 'pa_indicators') {
        api.setState('tableNameFetchInput', 'goal');
        let kpiData = api.data.getTableDetails.output.result;
        kpiData = kpiData.map((data) => ({
            'id': data.sys_id,
            'label': data.name
        }));
        api.setState('kpiData', kpiData);
    }
    else if (event.elementId === 'get_dashboard_data') {
        let kpiDashboardData = api.data.get_dashboard_data.results;
        kpiDashboardData = kpiDashboardData.map((data) => ({
            'id': data._row_data.uniqueValue,
            'label': data._row_data.displayValue
        }));
        api.setState('kpiDashboardData', kpiDashboardData);
    }
    // list of playbooks are populated from sys_pd_process_definition table
    else if (api.state.sourceType === 'PLAYBOOK_DATA') {
        let sourceFieldData = api.data.getTableDetails.output.result;
        sourceFieldData = sourceFieldData.map(data => ({
            id: data.sys_id,
            label: data.label,
            sublabel: data.sys_created_on
        })).sort((a, b) => new Date(b.sublabel) - new Date(a.sublabel))
        api.setState('sourceDataInputValues', sourceFieldData);
        api.setState('isSourceDataLoaderDisabled', true);
    }
}
