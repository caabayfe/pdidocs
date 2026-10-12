var CumulativeFieldMigrationUtil = Class.create();
CumulativeFieldMigrationUtil.prototype = {
    initialize: function() {},

    /*
        function to migration Cumulative target field to Target value distribution where review frequecncy is not empty
	*/
    migrateCumulitiveField: function() {
        try {
            gs.info("MigrateBreakdownToCheckinfrequency: migrateCumulitiveField: Starting cumulitive field migration");
            this.updateCumulativeFieldForBreakdownIntervalTargets();
            gs.info("MigrateBreakdownToCheckinfrequency migrateCumulitiveField: Completed cumulitive field migration");
        } catch (error) {
            gs.error('MigrateBreakdownToCheckinfrequency migrateCumulitiveField: Failed to migrate cumulative targets Error:' + error);
        }

    },

    updateCumulativeFieldForBreakdownIntervalTargets: function() {
        var nonCumulativeTargetRecord = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_TARGET_TABLE);
        nonCumulativeTargetRecord.addQuery('cumulative_target', false);
        nonCumulativeTargetRecord.addNotNullQuery('breakdown_interval');
        nonCumulativeTargetRecord.setValue('target_value_distribution', 'non_cumulative');
        nonCumulativeTargetRecord.setWorkflow(false);
        nonCumulativeTargetRecord.updateMultiple();

        var cumulativeTargetRecord = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_TARGET_TABLE);
        cumulativeTargetRecord.addQuery('cumulative_target', true);
        cumulativeTargetRecord.addNotNullQuery('breakdown_interval');
        cumulativeTargetRecord.setValue('target_value_distribution', 'cumulative');
        cumulativeTargetRecord.setWorkflow(false);
        cumulativeTargetRecord.updateMultiple();
    },

	updateCumulativeFlagOnTarget: function(targetList, fieldValue){
		if(global.JSUtil.nil(targetList))
			return;
		var nonCumulativeTargetRecord = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_TARGET_TABLE);
        nonCumulativeTargetRecord.addQuery('sys_id', 'IN' , targetList.toString());
        nonCumulativeTargetRecord.setValue('target_value_distribution', fieldValue);
        nonCumulativeTargetRecord.setWorkflow(false);
        nonCumulativeTargetRecord.updateMultiple();
	},

    type: 'CumulativeFieldMigrationUtil'
};
