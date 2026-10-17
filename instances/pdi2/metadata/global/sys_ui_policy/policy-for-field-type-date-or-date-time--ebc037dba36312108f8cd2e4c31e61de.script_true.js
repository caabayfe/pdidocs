function onCondition() {
    var SCRIPT2 = "secondary_script";
	var SCRIPT = "script";

    if (!g_form.getElement(SCRIPT2)) {
        return;
    }

    g_form.setLabelOf(SCRIPT2, 'End of Date Range');
    g_form.showFieldMsg(SCRIPT2, 'Set script expression to return end of the time range','info', true);

    g_form.setLabelOf(SCRIPT, 'Start of Date Range');
    g_form.showFieldMsg(SCRIPT, 'Set script expression to return start of the time range','info', true);
}
