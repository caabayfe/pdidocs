function redirectToEditManual() {
	var record = new GlideRecord('cmdb_group');
	record.addQuery('sys_id', g_form.getUniqueValue());
	record.query(queryResponse);
}

function queryResponse(rec) {
	if(rec) {
		while(rec.next()) {
			var url = new GlideURL('$relationshipEditor.do');
			if(url) {
				url.addParam('sysparm_collection', 'cmdb_group');

				// Add only the client options to prevent another AJAX call
				url.addParam('sysparm_collectionID', g_form.getUniqueValue());
				url.addParam('sysparm_collectionType', 'manualGroup');
				url.addParam('sysparm_domainID', rec.sys_domain);
				
				this.location = url.getURL();
			}
		}
	}
}
