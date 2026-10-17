function onCondition() {
    var SCRIPT2 = "secondary_script";
	var SCRIPT = "script";

    if (!g_form.getElement(SCRIPT2)) {
        return;
    }

	g_form.setLabelOf(SCRIPT2, "Secondary Script");
    g_form.hideFieldMsg(SCRIPT2, true);

    g_form.setLabelOf(SCRIPT, 'Script');
    g_form.hideFieldMsg(SCRIPT, true);
}
