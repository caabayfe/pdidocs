//Set all to not_pushed or push_not_committed state
var push = new SNC.PushAPI();
push.updateHistoryVersionStateForCancelledHistory(current.sys_id, current.type);
