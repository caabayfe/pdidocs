var MLClusteringUtils = Class.create();
MLClusteringUtils.prototype = {
    initialize: function() {
    },
	
	deleteClusterAssignments: function(solutionName, age) {
		//age as the parameter at the minute level
		var milliSecsInDay = age*60*1000;
		var gdt = new GlideDateTime();
		//move date behind by 24hrs
		gdt.subtract(milliSecsInDay);
		//convert to UTC
		gdt.subtract(gdt.getTZOffset());
		var options = {
			"updatedUntil": new String(gdt.getDisplayValueWithoutTZ())
		};
		var mlSolution = sn_ml.ClusteringSolutionStore.get(solutionName);
		var mlSolutionVersion = mlSolution.getActiveVersion();
		mlSolutionVersion.deleteClusterAssignments(options);
	},
	
	deleteUnavailableClusterModels: function(age) {
		age = (!age || isNaN(age)) ? 1 : age;
		//keep 1 week's history default.
		var milliSecsInDay = parseInt(age)*7*86400*1000;
		var gdt = new GlideDateTime();
		//move date behind by 1 week
		gdt.subtract(milliSecsInDay);
		var options = {
			"updatedUntil": new String(gdt.getUTCValue())
		};
		var gr = new GlideRecord('ml_capability_definition_clustering');
		gr.addQuery('request_source', 'api');
		gr.query();
		while (gr.next()) {
			try {
				var solutionName = gr.getValue('solution_name');
				gs.info("Deleting unavailable cluster models for " + solutionName);
				var mlSolution = sn_ml.ClusteringSolutionStore.get(solutionName);
				var mlSolutionVersion = mlSolution.getActiveVersion();
				var deletedCount = mlSolutionVersion.deleteUnavailableClusterModels(options);
				gs.info("Deleted " +  deletedCount + " unavailable cluster models for " + solutionName);
			} catch (ex) {
				gs.print('Exception caught for solution : ' + solutionName + ': ' + ex.getMessage());
			}
		}
	},
	validateTableName : function(tableName){
		if(tableName){
			var gr = new GlideRecord('sys_db_object');
			gr.addQuery('name', tableName);
			gr.query();
			return gr.next();
		}
		return false;
	},
	solutionHasclusterinsightrecords : function(table_name, solution_id){
		if (!JSUtil.nil(table_name) && !JSUtil.nil(solution_id)){
			var gr = new GlideRecord(table_name);
			gr.addQuery('solution',solution_id);
			gr.setLimit(1);
			gr.query();
			if(gr.next()){
				return true;
			}
			return false;
		}
	},
	getClusterInsightTable:function(solution_id){
		var table_name = "";
		if(JSUtil.nil(solution_id)){
			return table_name;
		}
		var gr = new GlideRecord("ml_solution");
		if (gr.get(solution_id)) {
			table_name = "ml_ci_"+gr.getValue("solution_name");
			if (table_name.length > 80) {
				table_name = table_name.substring(0,80);
			}
			if (this.validateTableName(table_name) && this.solutionHasclusterinsightrecords(table_name, solution_id)) {
				return table_name;
			} else {
				return "";
			}
		}
		return table_name;
	},
	type: 'MLClusteringUtils',
};
