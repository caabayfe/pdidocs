var hs = new GlideHistorySet(current);
var sys_id = hs.generate();

action.setRedirectURL("sys_history_set.do?sys_id=" + sys_id);
action.setReturnURL(current);
