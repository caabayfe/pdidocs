function onLoad() {
    if (g_form.isNewRecord()) {
        g_form.setValue('finding_def', g_scratchpad.findingDefSysId);
		if(g_form.getValue('sequence') == '') {
			var newSequenceNumber = parseInt(g_scratchpad.maxSequenceForRule) + 1;
			g_form.setValue('sequence', newSequenceNumber);
		}
    }
}
