function onLoad() {
	if (g_form.isNewRecord() || g_scratchpad.evaluation_method !== "survey")
		g_form.setVisible('sample_metric', false);
}
