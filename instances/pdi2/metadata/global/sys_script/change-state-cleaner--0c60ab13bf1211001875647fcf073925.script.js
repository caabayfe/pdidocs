//There can only be 1 local change for a record in an instance with the same state at 1 time
var push = new SNC.PushAPI();
push.cleanChangesAfterStateUpdate(current.sys_id, current.state, current.version.name, current.instance);
