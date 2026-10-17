current.addQuery('agent_correlator', parent.sys_id);
current.addQuery('sys_created_on', '>=', parent.sys_created_on);

var updated_time = new GlideDateTime(parent.sys_updated_on);
updated_time.addSeconds(1*60*60); //bound by extra hour to allow for better UX

current.addQuery('sys_created_on', '<=', updated_time); 
