// Verify the connection upon display only if the instance_id is nil, meaning, we've never
// successfully connected to this server (and therefore have no instance_id to truly identify this)
var gusw = new GlideUpdateSetWorker();
gusw.validateConnection(current.sys_id,current.url, current.username, current.password, false, false);
	
