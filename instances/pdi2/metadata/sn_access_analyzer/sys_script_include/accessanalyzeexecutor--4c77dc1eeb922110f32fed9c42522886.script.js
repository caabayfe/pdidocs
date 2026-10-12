var AccessAnalyzeExecutor = Class.create();
AccessAnalyzeExecutor.prototype = {
    initialize: function() {
    },

	analyze: function(current, action) {
		var operations = current.operations.getDisplayValue().split(/[ ,]+/);
		var entitySysId = this.getEntitySysId(current);
		var req = {
			entitySysId: entitySysId,
			entityType: current.analyze_by.toString(),
			targetName: this.getTargetName(current),
			targetResource: current.resource_type.toString(),
			targetField: current.target_field.toString(),
			targetMethod: current.target_rest_endpoint_method.toString(),
			targetRecord: current.target_record.toString(),
			targetOperations: operations
		};
		var x = new sn_identity.IdentitySecurityApi();
		var resp = x.getDebugLog(req);
		var apiResponse = JSON.parse(resp);
		if (!apiResponse.pass) {
			gs.addErrorMessage(gs.getMessage("Analyze access failed : {0}", apiResponse.errorMessage));
			current.setAbortAction('true');
		} else {
			action.setRedirectURL(current);
			current.analyzed_by = current.analyze_by + ": " + this.getEntityName(current);
			current.last_run = new GlideDateTime();
			answer = current.insert();
			new sn_access_analyzer.AccessAnalyzerUtil().saveResult(resp, current);
			gs.include('ActionUtils');
			var au = new ActionUtils();
			au.postInsert(current);
		}
	},

	reanalyze: function(current, action) {
		action.setRedirectURL(current);
		var operations = current.operations.getDisplayValue().split(/[ ,]+/);
		var entitySysId = this.getEntitySysId(current);
		var req = {
			entitySysId: entitySysId,
			entityType: current.analyze_by.toString(),
			targetName: this.getTargetName(current),
			targetResource: current.resource_type.toString(),
			targetField: current.target_field.toString(),
			targetMethod: current.target_rest_endpoint_method.toString(),
			targetRecord: current.target_record.toString(),
			targetOperations: operations
		};
		var x = new sn_identity.IdentitySecurityApi();
		var resp = x.getDebugLog(req);
		var apiResponse = JSON.parse(resp);
		if (!apiResponse.pass) {
			gs.addErrorMessage(gs.getMessage("Analyze access failed : {0}", apiResponse.errorMessage));
		} else {
			current.last_run = new GlideDateTime();
			current.update();
			new sn_access_analyzer.AccessAnalyzerUtil().saveResult(resp, current);
		}
	},

	getEntitySysId: function(current) {
		var analyzeBy = current.analyze_by.toString();
		if (analyzeBy === "User") {
			return current.user.toString();
		} else if (analyzeBy === "Group") {
			return current.group.toString();
		} else if (analyzeBy === "Role") {
			return current.role.toString();
		}
		return "";
	},

	getTargetName: function(current) {
		switch(current.resource_type.toString()) {
			case "client_callable_script_include":
				return current.getDisplayValue("target_client_callable_script_include").toString();

			case "rest_endpoint":
				return current.target_rest_endpoint.toString();

			case "ui_page":
				return current.target_ui_page.toString();

			case "record": //default will be returned
			default:
				return current.target_table.toString();
		}
	},

	getEntityName: function(current) {
		var analyzeBy = current.analyze_by.toString();
		if (analyzeBy === "User") {
			return current.user.name.toString();
		} else if (analyzeBy === "Group") {
			return current.group.name.toString();
		} else if (analyzeBy === "Role") {
			return current.role.name.toString();
		}
		return "";
	},

    type: 'AccessAnalyzeExecutor'
};
