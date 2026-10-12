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
    var qQueryWithDate = '';
    var dateQuery = '';
    const q = api.context.props.queue;
    if (q != undefined && q != null) {
        query = 'queue=' + q;
    }
    qQueryWithDate = query;
    const e = api.context.props.event;
    if (e != undefined && e != null) {
        query = query + '^event=' + e;
    }

    const start = api.context.props.start;
    const end = api.context.props.end;

    if (start != undefined && start != null) {
        //interval_start>=javascript:gs.dateGenerate('2023-01-22','00:00:00')^interval_end<=javascript:gs.dateGenerate('2023-01-24','23:59:59')
        dateQuery = "interval_start>=javascript:gs.dateGenerate('";
        const sArr = start.split(" ");
        if (sArr.length > 1) {
            dateQuery = dateQuery + sArr[0] + "','" + sArr[1] + "')";
        } else {
            dateQuery = dateQuery + sArr[0] + "','00:00:00' )";
        }

        const eArr = end.split(" ");
        if (eArr.length > 1) {
            dateQuery = dateQuery + "^interval_end<=javascript:gs.dateGenerate('" + eArr[0] + "','" + eArr[1] + "')";
        } else {
            dateQuery = dateQuery + "^interval_end<=javascript:gs.dateGenerate('" + eArr[0] + "','00:00:00' )";
        }
        if (query == '') {
            query = dateQuery;
        } else {
            query = query + '^' + dateQuery;
        }
    }

    api.setState('state_stats_query_with_params', query);

    if (dateQuery != '') {
        api.setState('state_stats_date_query', dateQuery);
        qQueryWithDate = qQueryWithDate + '^' + dateQuery;
    }

    api.setState('state_processor_stats_list_filter', qQueryWithDate); //same query is used for queue stats aswell
    api.setState('state_active_jobs_query', qQueryWithDate + "^processor_type=parallel^ORprocessor_type=sequential")
    api.setState('state_processor_stats_list_view_all_url', "/sysevent_processor_instance_stats_list.do?sysparm_query=" + qQueryWithDate);
    api.setState('state_queue_stats_list_view_all_url', "/sysevent_queue_stats_list.do?sysparm_query=" + qQueryWithDate);
    api.setState('state_event_stats_list_view_all_url', '/sysevent_event_stats_list.do?sysparm_query=' + query);
    api.setState('state_handler_stats_list_view_all_url', '/sysevent_handler_stats_list.do?sysparm_query=' + query);
}
