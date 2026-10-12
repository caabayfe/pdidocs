var GlobalRCAScopeReferenceQualifier = Class.create();
GlobalRCAScopeReferenceQualifier.prototype = {
    initialize: function() {},
    sourceQualifier: function(current) {
        if (current.target_scope != 'global')
            return '';

        var gr = new GlideRecord('sys_scope');
        gr.query();
        var listOfScopes = [];
        var scopeObj = new GlideScopeAPI();
        while (gr.next()) {
            if (scopeObj.isServiceNowScope(gr.getValue('scope'))) {
                listOfScopes.push(gr.getUniqueValue());
            }
        }

        return 'sys_idIN' + listOfScopes.join(',');

    },
    targetQualifier: function(current) {
        if (JSUtil.nil(current.source_scope) || new GlideScopeAPI().isServiceNowScope(current.source_scope.scope))
            return '';

        return 'scope!=global';
    },
};
