var ExtendedStatisticsService = Class.create();
ExtendedStatisticsService.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	createExtendedStatistics: function() {
		var tableName = this.getParameter('sysparm_table_name');
		var statisticName = this.getParameter('sysparm_statistic_name');
		var statisticTypes = this.getParameter('sysparm_statistic_types');
		var columns = this.getParameter('sysparm_columns');

		SNC.ExtendedStatisticsService.createExtendedStatistics(tableName, statisticName, columns, statisticTypes);
	},

	dropExtendedStatistics: function() {
		var tableReference = this.getParameter('sysparm_table_ref');
		var statisticName = this.getParameter('sysparm_stat_name');

		SNC.ExtendedStatisticsService.dropExtendedStatistics(statisticName, tableReference);
	},

    type: 'ExtendedStatisticsService'
});
