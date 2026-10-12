/**
 *  ServiceNow: Confirm MID Server Actions (Restart MID, Upgrade MID)
 */
function onSubmit() {
    var actionID = g_form.getActionName();
    var actionControl = $(actionID);
    if (!actionControl)
        return;

    var actionName = actionControl.getAttribute('gsft_action_name');
    if (actionName == 'mid_upgrade') {
        if (!confirm(getMessage('Upgrade MID Server?')))
            return false;
    }
    if (actionName == 'mid_restart') {
        if (!confirm(getMessage('Restart MID Server?')))
            return false;
    }
}
