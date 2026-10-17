(function() {
	var local_cred_store_type = 'e611433fbf020100710071a7bf073921';
	//Don't the order of workflow names and ids.
    var workflow_names = ["passd_reset_wf", "pwd_change_wf", "unlock_user_wf", "conn_test_wf", "get_lock_state_wf"];
    var workflows = ["b4887ebbbf020100710071a7bf07398c", "a5974473eb2311006a668c505206fe84", "1bcbfe1bbf111100c7e39058ff07390f", "e32c1131eb5201002db7648d9106feae", "6ac8de43bf111100c7e39058ff0739b3"];
	
    function wasWfModified(storetypeGr, wf_name, wfid) {
        var currentWfid = storetypeGr.getValue(wf_name);
        if (!gs.nil(currentWfid) && currentWfid != wfid)
            return true;

        var wf_update = new GlideRecord('sys_update_xml');
        wf_update.addQuery('name', 'wf_workflow_' + wfid);
        wf_update.query();
        if (wf_update.hasNext())
            return true;

        return false;
    }

    var storetypeGr = new GlideRecord('pwd_cred_store_type');
    storetypeGr.get(local_cred_store_type);
    var switchToFlows = true;

    for (var i in workflows)
        switchToFlows = switchToFlows && (!wasWfModified(storetypeGr, workflow_names[i], workflows[i]));

    if (!switchToFlows) {
        storetypeGr.setValue('use_flow', false);
        storetypeGr.update();
    }

})();
