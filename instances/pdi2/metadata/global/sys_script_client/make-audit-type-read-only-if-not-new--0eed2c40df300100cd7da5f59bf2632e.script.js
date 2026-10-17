function onLoad() {
	// Try to deduce audit type based on the query string
	var getAuditType = function(query) {
		var queryTerms = query.split('^');
		for(var i = 0; i < queryTerms.length; i++) {
			var queryTerm = queryTerms[i];
			if(queryTerm.startsWith('audit_type')) {
				var re = /audit_type=(.*)/;
				var result = re.exec(queryTerm);
				if(result && result.length == 2)
					return result[1];
			}
		}
		return null;
	}
	   
	var params = (window.location + '').toQueryParams();
	var auditType = null;
	if('sysparm_query' in params)
		auditType = getAuditType(params.sysparm_query);
	
	// If this is a new template
	if(g_form.isNewRecord()) {
		// If we found an audit type to suggest, set that
		// value
		if(auditType != null)
			g_form.setValue('audit_type', auditType);
		// Make it visible
		g_form.setVisible('audit_type', true);
		// Make it writable
		g_form.setReadOnly('audit_type', false);
	}
	else {
		// If this is an existing template, make the audit
		// type read only
		g_form.setReadOnly('audit_type', true);
	}
}
