function onCellEdit(sysIDs, table, oldValues, newValue, callback) {callback(true);}
	
	//call functions on load and re load
	normalizePriority("alert_sys_id.sn_priority");
	
	CustomEvent.observe("partial.page.reload",normalizePriority.curry('alert_sys_id.sn_priority'));
	CustomEvent.observe("list.section.toggle", normalizePriority.curry('alert_sys_id.sn_priority'));
