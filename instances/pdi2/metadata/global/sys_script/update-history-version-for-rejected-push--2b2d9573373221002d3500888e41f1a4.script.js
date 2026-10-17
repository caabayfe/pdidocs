//Set all to pending_push state
var push = new SNC.PushAPI();
push.updateHistoryVersionStateForCancelledHistory(current.sys_id, current.type);
