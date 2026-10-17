function saveStats(event) {
	if (event) {
		event.preventDefault();
	}

	var statisticName = gel('stat_name').value;
	var tableName = gel('table').value;
	var statisticTypes = Array.from(document.querySelectorAll('input[name="stat_option"]:checked')).map(c => c.value).join(',');
	var columns = gel('columns').value;

	if (!statisticName || !statisticTypes || !columns) {
		alert('All fields need to be populated.');
		return;
	}

	var ga = new GlideAjax('ExtendedStatisticsService');
	ga.addParam('sysparm_name', 'createExtendedStatistics');
	ga.addParam('sysparm_table_name', tableName);
	ga.addParam('sysparm_statistic_name', statisticName);
	ga.addParam('sysparm_statistic_types', statisticTypes);
	ga.addParam('sysparm_columns', columns);
	ga.getXML(function() {
		g_list.refresh();
	});
}

function removeDefaultValue() {
	var select = gel('columns_right');
	if (select && select.options.length > 0 && select.options[0].text === '--') {
		select.remove(0);
	}
}

addLoadEvent(removeDefaultValue)
