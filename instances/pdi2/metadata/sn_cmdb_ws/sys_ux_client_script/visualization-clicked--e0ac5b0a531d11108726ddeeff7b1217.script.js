/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        getFieldValueFromEncodedQuery
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const {
        payload
    } = event.payload;
    const {
        overviewType
    } = api.context.props;

    let groupName = payload.data.elements[0];
    let encodedQuery = '';
    let table = '';

    if (overviewType === 'summary') {
        let groupSysId = payload.params.breakdowns[0].elements[0];
        encodedQuery = `encoded_query.group.sys_id=${groupSysId}^ORDERBYDESCci_count`;
    } else if (overviewType === 'my-cis') {
        encodedQuery = payload.params.query;
        let splitQuery = encodedQuery.split('^');
        table = getFieldValueFromEncodedQuery(encodedQuery, 'sys_class_name=');
        encodedQuery = splitQuery.join('^');
    }

    let params = {
        groupName,
        query: encodedQuery,
        table
    };

    api.emit('CONTENT_UPDATED', {
        params
    });
}
