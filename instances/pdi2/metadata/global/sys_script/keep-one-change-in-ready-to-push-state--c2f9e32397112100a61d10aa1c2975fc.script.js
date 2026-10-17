//There can only be 1 local change for a record in an instance with the same state at 1 time
var push = new SNC.PushAPI();
push.keepOneChangeForGivenState(current.sys_id, 'pending_push');
