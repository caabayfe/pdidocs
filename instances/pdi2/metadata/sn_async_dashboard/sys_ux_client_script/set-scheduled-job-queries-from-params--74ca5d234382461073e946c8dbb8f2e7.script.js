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
    /*
        Sets the query that will be used on the line graphs
        and list filters when the page loads
    */

    var yesterdayInMs = 24 * 60 * 60 * 1000;
    var query = '';
    var dateQuery = '';

    var jc = api.context.props.job;
    if (jc) {
        query = 'job_classification=' + jc;
    }
    
    var p = api.context.props.priority;
    if (p) {
        if (query == '') {
            query = 'priority=' + p;
        } else {
            query = query + '^priority=' + p;
        }
    }

    var start = api.context.props.rangestart;
    var end = api.context.props.rangeend;

    // // If params are empty, set the default time range
    if (!start) {
        var tzOffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds

        var yesterday = new Date(new Date().getTime() - yesterdayInMs);
        var yesterdayISOTime = new Date(yesterday - tzOffset).toISOString();
                
        var date = yesterdayISOTime.split("T")[0];
        var time1 = yesterdayISOTime.split("T")[1].slice(0, 8);       
        start = date + ' ' + time1;

        var today = new Date();
        var todayISOTime = new Date(today- tzOffset).toISOString();
                
        var date = todayISOTime.split("T")[0];
        var time1 = todayISOTime.split("T")[1].slice(0, 8);   
        end = date + ' ' + time1;
    }

    // time_range_start>=javascript:gs.dateGenerate('2023-01-22','00:00:00')^time_range_end<=javascript:gs.dateGenerate('2023-01-24','23:59:59')
    dateQuery = "time_range_start>=javascript:gs.dateGenerate('";
    
    var sArr = start.split(" ");

    dateQuery += sArr.length > 1 ? 
    `${sArr[0]}','${sArr[1]}')` : 
    `${sArr[0]}','00:00:00')`;

    var eArr = end.split(" ");

    dateQuery += eArr.length > 1 ? 
    `^time_range_end<=javascript:gs.dateGenerate('${eArr[0]}','${eArr[1]}')` : 
    `^time_range_end<=javascript:gs.dateGenerate('${eArr[0]}','00:00:00')`;
    
    if (query == '') {
        query = dateQuery;
    } else {
        query = query + '^' + dateQuery;
    }

    api.setState('scheduled_jobs_full_query', query);
}
