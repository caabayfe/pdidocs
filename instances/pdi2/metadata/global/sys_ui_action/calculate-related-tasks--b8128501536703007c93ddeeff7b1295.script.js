var emAiInsight = new EmAiInsight();
var tasks = ["incident", "problem", "change_request"];
emAiInsight.calculateRelatedTaskResults(current.sys_id, tasks);
action.setRedirectURL(current);
