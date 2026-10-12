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
    const q = api.context.props.queue;
    if (q != undefined && q != null) {
        if (q == 'DEFAULT') {
            query = query + 'queue=NULL';
        } else {
            query = 'queue=' + q;
        }

    }
    const e = api.context.props.event;
    if (e != undefined && e != null) {
        query = query + '^name=' + e;
    }

    const start = api.context.props.start;
    const end = api.context.props.end;

    if (start != undefined && start != null) {
        //process_onBETWEENjavascript:gs.dateGenerate('2023-01-22','00:00:05')@javascript:gs.dateGenerate('2023-01-23','23:59:59')
        var dateQuery = "process_onBETWEENjavascript:gs.dateGenerate('";

        //add start datetime to dateQuery
        const sArr = start.split(" ");
        if (sArr.length > 1) {
            dateQuery = dateQuery + sArr[0] + "','" + sArr[1] + "')";
        } else {
            dateQuery = dateQuery + sArr[0] + "','00:00:00' )";
        }

        //add end datetime to dateQuery
        const eArr = end.split(" ");
        if (eArr.length > 1) {
            dateQuery = dateQuery + "@javascript:gs.dateGenerate('" + eArr[0] + "','" + eArr[1] + "')";
        } else {
            dateQuery = dateQuery + "@javascript:gs.dateGenerate('" + eArr[0] + "','00:00:00' )";
        }

        if (query == '') {
            query = dateQuery;
        } else {
            query = query + '^' + dateQuery;
        }
    }

    //set nav urls to sysevent related components
    let baseUrl = api.state.state_sysevent_base_url + query;
    api.setState('state_sysevent_total_events_url', baseUrl + '^' + api.state.state_sysevent_query_total_events);
    api.setState('state_sysevent_total_ready_events_url', baseUrl + '^' + api.state.state_sysevent_query_ready_events);
    api.setState('state_sysevent_total_inprocess_events_url', baseUrl + '^' + api.state.state_sysevent_query_inprocess_events);
    api.setState('state_sysevent_total_processed_events_url', baseUrl + '^' + api.state.state_sysevent_query_processed_events);
    api.setState('state_sysevent_total_errored_events_url', baseUrl + '^' + api.state.state_sysevent_query_errored_events);
    api.setState('state_sysevent_total_transferred_events_url', baseUrl + '^' + api.state.state_sysevent_query_transferred_events);

    api.setState('state_sysevent_query_with_params', query);
}
