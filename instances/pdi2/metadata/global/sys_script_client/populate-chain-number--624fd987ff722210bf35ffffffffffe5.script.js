function onLoad() {
    if(g_form.isNewRecord() && g_form.getValue('chain') == '' && g_form.getValue('finding_def')) {
        var newChainNumber = parseInt(g_scratchpad.existingRuleMaxChainNumber) + 1;
        g_form.setValue('chain', newChainNumber);
    }
	if(g_form.getValue('chain') != '') {
		g_form.setReadOnly('chain', true);
	}
}
