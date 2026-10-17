/**
 * Handles assignment logic defined for Trigger Rules.
 *
 * current is the record that triggered the trigger_rule
 * parm1 is the name of the rule record's table
 * parm2 is the trigger_rule sys_id
**/
// vars scope needs to be same as current, which is eventually provided to workflow API
var vars = {};
(function(current, vars) {
	new TriggerRule()
		.setEventName(event.name + "")
		.setRule(event.parm2 + "")
		.setRecord(current)
		.setWorkflowVars(vars)
		.process();
})(current, vars);
