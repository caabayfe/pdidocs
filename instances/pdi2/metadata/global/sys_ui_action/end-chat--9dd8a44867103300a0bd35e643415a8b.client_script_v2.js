function onClick(g_form) {

    if (g_user.userID != g_form.getValue('assigned_to')) {
        g_modal.alert('Only the assignee of this interaction can end the chat.');
        return;
    }
    var completedState = 'closed_complete';

	// Transition to wrap_up state if Interaction Wrap Up configuration is enabled
    var ga = new GlideAjax('WrapUpInteractionAjaxUtil');
    ga.addParam('sysparm_name', 'isWrapUpEnabled');
    ga.addParam('sysparm_recSysId', g_form.getSysId());
    ga.getXML(getAnswer);

    function getAnswer(response) {
        var isWrapUpEnabled = response.responseXML.documentElement.getAttribute("answer");
        if (isWrapUpEnabled == "true")
            completedState = "wrap_up";

        var msg = getMessage("Are you sure you want to end this chat?");
        g_modal.confirm(getMessage("Confirmation"), msg, function(confirmed) {
            if (confirmed) {
                g_form.setValue('state', completedState);
	
                if (g_form.getValue('state_reason') === "")
                    g_form.setValue('state_reason', 'agent_ended');
				
                g_form.save();
            }

        });
    }

    return false;
}
