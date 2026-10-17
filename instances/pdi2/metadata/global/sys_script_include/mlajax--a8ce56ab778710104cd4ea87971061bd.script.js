var MLAjax = Class.create();
MLAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	checkEntitlements : function() {
		var capability = this.getParameter('sysparm_capability');
		var validationObj = new MlValidationHelper().checkEntitlements(capability);
		return JSON.stringify(validationObj);
	},
	
	getclusterinsighttable : function() {
		var resultObj = {
			'result':'success',
			'msg':'',
			'table':''
		};
		if(!this.canProceed()){
			resultObj.result ='failure';
			resultObj.msg = gs.getMessage('User not authorised to run this api');
			gs.addErrorMessage(resultObj.msg);
			return JSON.stringify(resultObj);
		}
		var solution_id = this.getParameter('sysparm_solutionid');
		if (JSUtil.nil(solution_id)){
			resultObj.result = 'failure';
			resultObj.msg = gs.getMessage('solution is not present');
			gs.addErrorMessage(resultObj.msg);
			return JSON.stringify(resultObj);
		}
		var table_name = new global.MLClusteringUtils().getClusterInsightTable(solution_id);
		if (table_name) {
			resultObj.table = table_name;
		}
		return JSON.stringify(resultObj);
	},
	
	getClusterSample: function(){
		var resultObj = {
			'result':'success',
			'msg':'',
			'records':'',
			'cluster_id':''
		};
		if(!this.canProceed()){
			resultObj.result = 'failure';
			resultObj.msg = gs.getMessage('User not authorised to run this api');
			gs.addErrorMessage(resultObj.msg);
			return JSON.stringify(resultObj);
		}
		var queryString = this.getParameter('sysparm_query');
		var tblName = this.getParameter('sysparm_tblname');
		
		var checkgr = new GlideAggregate(tblName);
		checkgr.addEncodedQuery(queryString);
		checkgr.addAggregate('COUNT','cluster_id');
		checkgr.query();
		if(checkgr.getRowCount() > 1){
			// there is more than one cluster and cluster can be generated for one cluster only
			resultObj.result = 'failure';
			resultObj.msg = gs.getMessage('Cluster Samples can be generated for only one cluster');
			gs.addErrorMessage(resultObj.msg);
			return JSON.stringify(resultObj);
		}
		var gr = new GlideRecordSecure(tblName);
		gr.addEncodedQuery(queryString);
		gr.setLimit(1);
		gr.query();
		var solution, cluster, cluster_id,solution_version;
		if (gr.next()) {
			solution = gr.solution.solution_name.toString();
			solution_version = gr.solution.version.toString();
			cluster = parseInt(gr.cluster_id.cluster_id, 10);
			cluster_id = gr.cluster_id + '';
		}
		// Call ML centroid API
		var mlSolution = sn_ml.MLSolutionFactory.getSolution(solution,{'version':solution_version});
		var options = {};
		options.top_n_per_cluster = 25;
		options.cluster_id = cluster;
		var result = JSON.parse(mlSolution.getClusterAssignments(options));
		if (result.length > 0) {
			// Return record Ids as filter to refresh the list
			var recIds = result.map(function(res) {
				return res.rec_sys_id;
			}).join();
			resultObj.result = 'success';
			resultObj.records = recIds;
			resultObj.cluster_id = cluster_id;
		} else {
			resultObj.result = 'failure';
			resultObj.msg = gs.getMessage("Failed to generate representative samples.");
			gs.addErrorMessage(resultObj.msg);
		}
		return JSON.stringify(resultObj);
	},
	
	canProceed: function(){
		var allowedRoles = ['admin','ml_admin'];
		if(gs.hasRole(allowedRoles))
			return true;
		return false;
	},
	
    type: 'MLAjax'
});
