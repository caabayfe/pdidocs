var stack = gs.getSession().getStack("default");
stack.push("cmn_rota.do?sys_id=" + current.sys_id);

var ocRotation = new OnCallRotation();
var isGroupEscalation = ocRotation.isGroupEscalationApplied(current.sys_id + '');

if (isGroupEscalation || current.use_custom_escalation)
	action.setRedirectURL("$oc_escalation_designer.do?sysparm_stack=no&sysparm_rota_id=" + current.sys_id);
else
	action.setRedirectURL("$oc_shift_escalation.do?sysparm_stack=no&sysparm_rota_id=" + current.sys_id);
