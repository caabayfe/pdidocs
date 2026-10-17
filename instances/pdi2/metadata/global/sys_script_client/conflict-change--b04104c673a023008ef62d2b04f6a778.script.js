function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    function getSchedulingConflictMessage() {
        var startDateReadOnly = g_form.isReadOnly("", g_form.getControl("start_date"));
        var endDateReadOnly = g_form.isReadOnly("", g_form.getControl("end_date"));

        if (startDateReadOnly || endDateReadOnly)
            return new GwtMessage().getMessage("Scheduling conflict detected. Review the Conflicts form section.");
        return new GwtMessage().getMessage("Scheduling conflict detected. Use the <a href='javascript:void(0);' onclick='openNextAvailableTime()'>Scheduling Assistant</a> to avoid conflicts.");
    }

    function showConflictNotification() {
		var showConflictMessage = g_scratchpad.show_conflict_message;

        if (showConflictMessage.property === "never") return false;
        if (showConflictMessage.property === "always") return true;

		var showNotification = showConflictMessage.preference;
        return showNotification;
    }

    //We don't want to render the warning and link to the conflict scheduler if we're in 'print' mode
    var gURL = new GlideURL();
    gURL.setFromCurrent();
    var isPrint = !!gURL.getParam("sysparm_media");

    if (!isPrint && newValue === "Conflict" && showConflictNotification()) {
        g_form.addWarningMessage(getSchedulingConflictMessage(), "conflict_warn_status");
        if (window && window.refreshConflicts)
            window.refreshConflicts();
        return;
    } else if (isLoading || newValue === '')
        return;

    // Remove the warning message as status is not Conflict.
    var chgGlideUI = GlideUI.get();
    var messageKey = "warning_" + getSchedulingConflictMessage();

    if (!chgGlideUI.messages[messageKey])
        return;

    delete chgGlideUI.messages[messageKey];

    var messageCount = Object.keys(chgGlideUI.messages).length;
    if (messageCount === 0)
        chgGlideUI.clearOutputMessages();
    else {
        var msgElement = $("conflict_warn_status");
        if (msgElement)
            msgElement.remove();
    }

    if (window && window.refreshConflicts)
        window.refreshConflicts();
}
