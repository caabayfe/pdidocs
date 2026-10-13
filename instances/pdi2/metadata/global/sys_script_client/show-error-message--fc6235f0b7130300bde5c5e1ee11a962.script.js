function onLoad() {
    var message;
    //Type appropriate comment here, and begin script below
    var orgError = g_form.getValue("error_msg");
    if ((orgError) && ("No active actions" === orgError)) {

        message = getMessage("Rule was automatically set to non-active as there was no active actions associated with it. Set the rule back to Active after creating new actions or activating existing ones.");
        g_form.addErrorMessage(message);

    }
    if ((orgError) && ("Tags are not supported" === orgError)) {
        message = getMessage("Rule was automatically set to non-active as the tags field in the alert filter is not supported. Set the rule back to active after removing the tags field from the alert filter.");
        g_form.addErrorMessage(message);
    }
    if ((orgError) && ("Priority is not supported" === orgError) && (g_scratchpad.enable_alert_priority_group_explicit_update === "false")) {
        message = getMessage("The Priority field in the alert filter is not supported.");
        g_form.addErrorMessage(message);
    }
    if ((orgError) && ("Impacted Services are not supported" === orgError)) {
        message = getMessage("The Impacted Services field in the alert filter is not supported.");
        g_form.addErrorMessage(message);
    }
    if ((orgError) && ("Assigned group not found" === orgError)) {
        message = new GwtMessage().getMessage("Rule was automatically set to non-active as the user group assigned to rule is not found in instance. Please create the user group or change the assignment.");
        g_form.addErrorMessage(message);
    }

    if ((orgError) && ("Dot-walk in alert filter" === orgError)) {
        message = getMessage("Using dot-walking in the alert filter conditions will not trigger the alert management rule if the change was in the related record fields. The alert management rule is triggered only by updates to the alert fields themselves and not by updates to the fields of the related record.");
        g_form.addInfoMessage(message);

    } else if ("false" == (g_form.getValue("active"))) {
        message = getMessage("Rule is not active and will not be applied. Set 'Active' field on the 'Alert Info' tab to activate the rule.");
        g_form.addInfoMessage(message);
    }
}
