var timeoutSeconds = parseInt(gs.getProperty('error.framework.action.timeout', '300'));
var threshold = new GlideDateTime();
threshold.addSeconds(-timeoutSeconds);

var items = new GlideRecord('sys_error_action_exec_item');
items.addQuery('state', 'in_progress');
items.addQuery('sys_updated_on', '<=', threshold);
items.query();

while (items.next()) {
  items.state = 'timeout';
  items.execution_time_ms = timeoutSeconds * 1000;
  items.error_message = 'Action execution timed out after ' + timeoutSeconds + ' seconds';
  items.update();
}
