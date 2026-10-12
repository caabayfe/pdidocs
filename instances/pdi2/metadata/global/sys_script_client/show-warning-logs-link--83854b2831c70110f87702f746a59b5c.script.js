function onLoad() {
    if (g_scratchpad.warningLogCount && g_scratchpad.warningLogCount > 0) {
        var link = "<a href='" + g_scratchpad.warningLogsLink + "' target='_blank'>Click here</a>";
        var msg = new GwtMessage().getMessage("There are {0} warnings present in logs. {1} to view", g_scratchpad.warningLogCount, link);
        g_form.addWarningMessage(msg);
    }
}
