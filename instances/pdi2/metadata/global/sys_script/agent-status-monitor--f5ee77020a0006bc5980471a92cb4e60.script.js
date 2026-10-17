/**
 * Service-now.com
 *
 * Description: The business rule monitors the status of the MID server and throws events accordingly.
 */
var MID_SERVER_DOWN = 'mid_server.down';
var eventName = "mid_server." + current.status.toLowerCase().split(' ').join('_');
var agentName = '' + current.name;
gs.eventQueue(eventName, current, agentName, isDuplicate(eventName, agentName) ? '_duplicate_' : '');
if (eventName === MID_SERVER_DOWN)
    executeScheduledJobNowWithDelay(15 * 1000); // execute the scheduled job in 15 seconds from now

// execute the scheduled job "Process mid_server.down events"
function executeScheduledJobNowWithDelay(delay_ms) {
    var gr = GlideRecord("sys_trigger");
    if (gr.get('fec60f3253272010347cddeeff7b12ff') && gr.state == 0) {
      var currentMs = new GlideDateTime().getNumericValue();
      gr.next_action.setDateNumericValue(currentMs + delay_ms);
      gr.update();
    }
}

function isDuplicate(eventName, agentName) {
    if (eventName !== MID_SERVER_DOWN)
        return false;
    var gr = new GlideRecord("sysevent");
    gr.addQuery('name', eventName);
    gr.addQuery('queue', MID_SERVER_DOWN); // queue name defined by sysevent_register
    gr.addQuery('parm1', agentName);
    var qc = gr.addNullQuery('parm2');
    qc.addOrCondition('parm2', '!=', '_duplicate_');
    gr.addQuery("state", 'NOT IN', "processed,error");
    var s = new GlideDateTime();
    s.subtract(3600 * 1000 * 24 * 2); // 2 days
    gr.addQuery("sys_created_on", '>=', s);
    gr.addQuery("sys_created_on", '<=', new GlideDateTime());
    gr.setLimit(1);
    gr.query();
    return (gr.hasNext());
}
