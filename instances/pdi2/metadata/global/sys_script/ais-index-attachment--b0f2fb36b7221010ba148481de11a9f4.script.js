(function executeRule(current, previous /*null when async*/) {
	var tableName = current.table_name; // the table owning the attachment
	
	// when we get summaries, they are represented as attachments on attachments
	if (tableName == 'sys_attachment')
		return;
	
	var sysId = current.sys_id;
	var aisConfig = new sn_ais.AisUtil();
	
	var op = current.operation();
	if (op == 'delete') {
		// STRY63947031: If the parent record is already gone, this is a cascade delete —
		// the parent's deleteSingleRecord handles attachment cleanup via deleteByQuery.
		var parentGR = new GlideRecord(current.table_name);
		if (!parentGR.get(current.table_sys_id))
			return;
		new sn_ais.IndexEvent().deleteAttachment(tableName, sysId);
		return;
	} else {
		var state = current.state;
		
		var nowAvailable = state == 'available' || state == 'available_conditionally' || state == '' || state =='pending';
		var prevAvailable = false;
		if (previous) {
			var prevState = previous.state;
			prevAvailable = prevState == 'available' || prevState == 'available_conditionally' || prevState == '' || prevState =='pending';
		}
		
		if (!nowAvailable && prevAvailable) {
			// e.g. virus scanner nuked this attachment
			// this should really be treated as deletion
			new sn_ais.IndexEvent().deleteAttachment(tableName, sysId);
			return;
		}
		
		if (!nowAvailable)
			return;
		
		if (op == 'update') {
			if (prevAvailable) {
				// if this looks like it's just a state change, e.g. from pending to
				//    available_conditionally / available...
				// ... we don't really want to re-index
				var triggerIndex = false;
				for (var k in current) {
					if (k != 'state' && k != 'sys_mod_count' && k != 'sys_updated_on' && current[k] != previous[k]) {
						triggerIndex = true;
					}
				}
				if (!triggerIndex) {
					return;
				}
			}
		}
		new sn_ais.IndexEvent().indexAttachment(sysId);
		return;
	}

})(current, previous);
