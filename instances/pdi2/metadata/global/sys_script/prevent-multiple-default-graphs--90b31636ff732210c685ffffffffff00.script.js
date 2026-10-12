(function executeRule(current, previous /*null when async*/) {

	// we want the Global Graph to be default
	if (current.getValue('sys_id') == '59096de943631210f384a4b67ab8f26f') {
		return;
	}

    var scope = 'global';
    var logicalGlobal = true;

    var currentScopeId = current.getValue('sys_scope'); 
    if (currentScopeId) {
        var scopeGR = new GlideRecord('sys_scope');
        if (scopeGR.get(currentScopeId)) {
            scope = scopeGR.getValue('scope') || 'global';
        }
    }

    logicalGlobal = (scope && scope.toLowerCase() === 'global');

    // Resolve app ids for the given scope key (apps whose sys_scope.scope == scope)
    var appIds = [];
    var app = new GlideRecord('sys_scope');
    app.addQuery('scope', scope);
    app.query();
    while (app.next()) {
        appIds.push(app.getUniqueValue()); // sys_id
    }

    // Build graph query to detect conflicts
    var gr = new GlideRecord('sys_meta_graph');

    if (logicalGlobal) {
        // (sys_scope IS NULL) OR (sys_scope IN appIds)
        var qc = gr.addNullQuery('sys_scope'); // legacy global
        if (appIds.length > 0) {
            qc.addOrCondition('sys_scope', 'IN', appIds.join(','));
        }
    } else {
        // If no app found for this non-global scope, there can't be a conflict
        if (appIds.length === 0) {
            return;
        }
        gr.addQuery('sys_scope', 'IN', appIds.join(','));
    }

    gr.addQuery('sys_id', '!=', current.getUniqueValue());
    gr.addQuery('default', true);
    gr.query();

    // only show message when needed
    if (gr.hasNext()) {
    	gs.addInfoMessage("The default flag was changed to false because another default graph already exists in this scope");
    }

    current.setValue('default', (!gr.hasNext()).toString());

})(current, previous);
