var userId = event.parm1;
var exec = new global.ExecuteMIMTriggerRulesWithImpersonation();
exec.triggerMIMRulesWithImpersonation(current, userId);
