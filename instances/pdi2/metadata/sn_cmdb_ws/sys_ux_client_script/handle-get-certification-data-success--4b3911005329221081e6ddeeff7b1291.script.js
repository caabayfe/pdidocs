/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
     const {
        getColumnDefinitions,
        getCertificationDashboardRows
    } = imports["sn_cmdb_ws.DataManagerCertificationDashboardUtil"](...arguments);
    let {instanceAggDataList = [], lastRefreshedTime, noCertPolicyExecutionFound = false, lastRowIdentifier, lastRowSysId}  = api.data.get_certification_instance_aggregate_data.output;
    api.setState('totalCountFilters', {...api.state.filters});
    api.setState('showEmptyState', noCertPolicyExecutionFound);
    const {isDesc, sortByField} = api.state;
    api.setState('instanceDataList', instanceAggDataList);
    const rowDefinitions = getCertificationDashboardRows(instanceAggDataList);
    api.setState('columnDefinitions', await getColumnDefinitions(isDesc, sortByField));
    api.setState('rowDefinitions', rowDefinitions);
    const noFilteredResults = instanceAggDataList.length ? false : true;
    api.setState('noFilteredResults', noFilteredResults); 
    api.setState('lastRefreshedTime', lastRefreshedTime);
    api.setState('nextStartIndex', ({currentValue}) => {
        return {
            ...currentValue,
            ["lastRowIdentifier"]: lastRowIdentifier,
            ["lastRowSysId"]: lastRowSysId
        };
    });
}
