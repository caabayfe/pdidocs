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
    var query = '';
    var queryWithUpadtedOn = '';
    var processorQuery = '';
    var dateQuery = '';
    var dateQueryWithUpdatedOn = '';

    const q = api.context.props.queue;
    if (q != undefined && q != null) {
        if (q == 'DEFAULT')
            processorQuery = 'queue=NULL';
        query = 'queue=' + q;
    }
    if (processorQuery == '')
        processorQuery = query;

    const e = api.context.props.event;
    if (e != undefined && e != null) {
        query = query + '^event=' + e;
    }
    const start = api.context.props.start;
    const end = api.context.props.end;
    queryWithUpadtedOn = query;
    if (start != undefined && start != null) {
        //interval_start>=javascript:gs.dateGenerate('2023-01-22','00:00:00')^interval_end<=javascript:gs.dateGenerate('2023-01-24','23:59:59')
        
        dateQuery = "sys_created_on>=javascript:gs.dateGenerate('";
        dateQueryWithUpdatedOn = "sys_updated_on>=javascript:gs.dateGenerate('";

        const sArr = start.split(" ");
        if (sArr.length > 1) {
            dateQuery = dateQuery + sArr[0] + "','" + sArr[1] + "')";
            dateQueryWithUpdatedOn = dateQueryWithUpdatedOn + sArr[0] + "','" + sArr[1] + "')";
        } else {
            dateQuery = dateQuery + sArr[0] + "','00:00:00' )";
            dateQueryWithUpdatedOn = dateQueryWithUpdatedOn + sArr[0] + "','00:00:00' )";
        }
        const eArr = end.split(" ");
        if (eArr.length > 1) {
            dateQuery = dateQuery + "^sys_created_on<=javascript:gs.dateGenerate('" + eArr[0] + "','" + eArr[1] + "')";
            dateQueryWithUpdatedOn = dateQueryWithUpdatedOn + "^sys_updated_on<=javascript:gs.dateGenerate('" + eArr[0] + "','" + eArr[1] + "')";
        } else {
            dateQuery = dateQuery + "^sys_created_on<=javascript:gs.dateGenerate('" + eArr[0] + "','00:00:00' )";
            dateQueryWithUpdatedOn = dateQueryWithUpdatedOn + "^sys_updated_on<=javascript:gs.dateGenerate('" + eArr[0] + "','00:00:00' )";
        }

        if (query == '') {
            query = dateQuery;
            queryWithUpadtedOn = dateQueryWithUpdatedOn;
        } else {
            queryWithUpadtedOn = query + '^' + dateQueryWithUpdatedOn;
            query = query + '^' + dateQuery;
        }
    }

    var processorExtUrl = processorQuery == '' ? '' : ('^' + processorQuery);
    var alertExtUrl = queryWithUpadtedOn == '' ? '' : ('^' + queryWithUpadtedOn);

    api.setState('state_alert_score_url', api.state.state_alert_score_base_url + alertExtUrl);
    api.setState('state_processor_score_url', api.state.state_processor_score_base_url + processorExtUrl);
    api.setState('state_processor_queue_query_with_params', processorQuery);
    api.setState('state_alerts_query_with_params', query);
    api.setState('state_alerts_query_with_params_using_updated_on', queryWithUpadtedOn);
}
