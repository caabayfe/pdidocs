function clientConfirm() {
	if (confirm("Caution: Dropping an extended statistic may result in performance degradation. Would you like to proceed?"))
		dropExtendedStatistic(g_form.getElement('reference_table').value, g_form.getElement('statistic_name').value);
}

function dropExtendedStatistic(tableReference, statName) {
	var ga = new GlideAjax('ExtendedStatisticsService');
	ga.addParam('sysparm_name', 'dropExtendedStatistics');
	ga.addParam('sysparm_stat_name', statName);
	ga.addParam('sysparm_table_ref', tableReference);
	ga.getXML(function() {});
}
