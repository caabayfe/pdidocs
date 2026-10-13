var ruleManager = new SNC.EventRuleManager();
var logAllRules = ruleManager.getDebugLogForEvent(current.sys_id);

var logStr = "";

for(var i= 0; i < logAllRules.length; i++) {
	logStr += logAllRules[i] + "<br/>";
}

action.setRedirectURL(current);
gs.addInfoMessage(logStr);
