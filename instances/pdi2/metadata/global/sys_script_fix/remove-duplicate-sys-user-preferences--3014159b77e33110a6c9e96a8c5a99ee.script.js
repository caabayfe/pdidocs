(function() {
    if (pm.isZboot())
        return;

    cleanupGlobalPreferences();

    function cleanupGlobalPreferences() {
        var ga = new GlideAggregate('sys_user_preference');
        ga.setWorkflow(false);
        ga.addQuery('system', '=', 1);
        ga.addNullQuery('user');
        ga.addAggregate('COUNT', 'name');
        ga.orderByAggregate('COUNT', 'name');
        ga.addHaving('COUNT', '>', '1');
        ga.query();
        while (ga.next()) {
            var preferenceName = ga.getValue('name');
            var latestSysID = getLatestUpdatedRecord(preferenceName);
            deleteDuplicates(preferenceName, latestSysID);
        }
    }

    function getLatestUpdatedRecord(preferenceName) {
        var gr = new GlideRecord('sys_user_preference');
        gr.addQuery('system', '=', 1);
        gr.addQuery('name', '=', preferenceName);
        gr.addNullQuery('user');
        gr.orderByDesc('sys_updated_on');
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            return gr.getUniqueValue();
        }
    }

    function deleteDuplicates(preferenceName, latestSysID) {
        var gr = new GlideRecord('sys_user_preference');
        gr.addQuery('system', '=', 1);
        gr.addNullQuery('user');
        gr.addQuery('name', '=', preferenceName);
        gr.addQuery('sys_id', '!=', latestSysID);
        gr.query();
        gr.deleteMultiple();
    }
    
})();
