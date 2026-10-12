//Make sure the connection is valid. If not, do not persist the record.
current.url = GlideStringUtil.normalizeWhitespace(current.url); 
var gusw = new GlideUpdateSetWorker();
var instanceId = gusw.validateConnection(current.sys_id,current.url, current.username, current.password, false, false);
if(instanceId == null)
	current.setAbortAction(true);
else
	current.instance_id = instanceId;
