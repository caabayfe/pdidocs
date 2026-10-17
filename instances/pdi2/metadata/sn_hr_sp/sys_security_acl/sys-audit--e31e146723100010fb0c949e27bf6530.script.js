answer = accessSysAudit();

function accessSysAudit() {
	var tableName = String(current.tablename);
	
	if (tableName == 'interaction') {
		var gr = new GlideRecord(tableName);
		if (!gr.get(current.documentkey) || !String(gr.application.scope).startsWith('sn_hr')) {
			return false;
		}
	} else 
		return false;

	return gs.hasRole('sn_hr_sp.esc_admin');
}
