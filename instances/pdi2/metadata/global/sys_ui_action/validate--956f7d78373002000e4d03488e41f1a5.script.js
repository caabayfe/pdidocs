function validateMid() {
    var agents = typeof g_list != 'undefined' ? g_list.getChecked() : g_form.getUniqueValue();
    var agentList = agents.split(",");

    for (var i = 0; i < agentList.length; i++)
        _validateMid(agentList[i]);

    // If we only have one agent selected from list view
    // or form view, check if has behaviors already defined
    // in which case we do not want to over-write them.
    if (agentList.length === 1) {
        // If the MID server belongs to a profile then do not attempt to set behaviors as those should be set in the profile
        var profileID = typeof g_form != 'undefined' ? g_form.getValue("profile_id") : _getProfileIDFromAgentID(agents);
        if (profileID)
            return;

        var msAjax = new GlideAjax("MIDServerAjax");
        msAjax.addParam("sysparm_name", "hasBehavior");
        msAjax.addParam("sysparm_agent", agents);
        msAjax.getXMLAnswer(function(answer) {
            if (answer !== 'true')
                openDialog(answer);
        });
    } else
        openDialog(agents);
}

function _getProfileIDFromAgentID(agentID) {
    var gr = new GlideRecord("ecc_agent");
    gr.get(agentID);
    return gr.getValue("profile_id");
}

function _validateMid(agent) {
    var msAjax = new GlideAjax("MIDServerAjax");
    msAjax.addParam("sysparm_name", "validateMID");
    msAjax.addParam("sysparm_agent", agent);
    msAjax.getXMLAnswer(null);
}

function openDialog(agents) {
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var gdw = new dialogClass("set_initial_selection_criteria");
    gdw.setTitle("Set Initial Selection Criteria");
    gdw.setWidth(350);
    gdw.setPreference("agents", agents);
    gdw.render();
}
