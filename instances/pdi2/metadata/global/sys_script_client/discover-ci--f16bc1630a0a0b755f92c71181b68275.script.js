/**
 *  Service-now.com: Confirm Upgrade request
 */
function onSubmit() {
    var actionID = g_form.getActionName();
    var actionControl = document.getElementById(actionID);
    if (!actionControl)
        return;

    var actionName = actionControl.getAttribute('gsft_action_name');
    if (actionName == 'discover_ci') {
        if (!confirm(getMessage('Start a new Discovery on this CI?')))
            return false;
    }
}
