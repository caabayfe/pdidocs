/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        overviewType,
        groupName,
        query
    } = api.context.props;

    if (overviewType === 'summary') {
        api.setState('visualizationId', '36d73bb2530d11108726ddeeff7b1217');
        api.setState('visualizationTitle', await helpers.translate('CI summary'));
        api.setState('table', 'sn_cmdb_ws_group_query_metadata');
        api.setState('tableTitle', groupName || await helpers.translate('CI summary'));
        api.setState('encodedQuery', query || 'ORDERBYDESCci_count');
        
        let groupBy = (query === '') ? 'encoded_query.group' : '';
        api.setState('tableGroupBy', groupBy);
    } else if (overviewType === 'my-cis') {
        api.setState('visualizationId', '27412883530d11108726ddeeff7b122f');
        api.setState('visualizationTitle', await helpers.translate('My CIs'));
        api.setState('table', api.context.props.table || 'cmdb_ci');
        api.setState('tableTitle', groupName || await helpers.translate('My CIs'));
        api.setState('encodedQuery', query || 'managed_by_groupDYNAMICd6435e965f510100a9ad2572f2b47744');

        let groupBy = (query === '' || groupName === 'Other') ? 'sys_class_name': '';
        api.setState('tableGroupBy', groupBy);
    }
}
