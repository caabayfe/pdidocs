var ProminPAUtil = Class.create();
ProminPAUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    isFormulaIndicator: function() {
        var uuid = this.getParameter('sysparm_uuid') || "";
        var source = this.getParameter('sysparm_source') || "";
        var json = new JSON();
        var response = {};
		response.status = "success";
		
        try {
            if (gs.nil(uuid) || gs.nil(source) || source != "pa") {
                throw "Invalid request parameters";
            }
            response.isFormulaIndicatorResponse = this._getResponseForFormulaIndicator(uuid);
        } catch (e) {
            response.status = "error";
            response.errorMessage = e;
        }
        return json.encode(response);
    },
    launchPOWorkbench: function() {
        var uuid = this.getParameter('sysparm_uuid') || "";
        var date = this.getParameter('sysparm_date') || "";
        var source = this.getParameter('sysparm_source') || "";
        var json = new JSON();
        var response = {};
		response.status = "success";

        try {
            if (gs.nil(uuid) || gs.nil(source) || source.toLowerCase() != "pa") {
                throw "Invalid request parameters";
            }
            response.scheduleResponse = this._getResponseForPAScheduling(uuid, date);
        } catch (e) {
			response.status = "error";
			response.errorMessage = e;
			if(!gs.nil(e.header)){
				response.errorMessage = e.errorMessage;
				response.header = e.header;
			}
        }
        return json.encode(response);
    },
    _getResponseForFormulaIndicator: function(uuid) {
        var response = SNC.ProcessOptimization.getIndicatorsForFormula(uuid);
        response = new JSON().decode(response);
        this._checkForErrorInResponse(response);
        return response;
    },
    _getResponseForPAScheduling: function(uuid, date) {
        var response = SNC.ProcessOptimization.schedulePaMining(uuid, date);
        response = new JSON().decode(response);
        this._checkForErrorInResponse(response);
        response.watchList = this._getWatchListUserList(response.projectDefId);
		response.executionId = this._getExecutionId(response.versionId);
        return response;
    },
    _checkForErrorInResponse: function(response) {
        if (response.status == "error") {
			if(!gs.nil(response.header)){
				throw response;
			}
            throw response.errorMessage;
        }
    },
    _getWatchListUserList: function(projectDefId) {
        var grProjectDef = new GlideRecord("promin_project");
        if (grProjectDef.get(projectDefId)) {
            return grProjectDef.getValue("watch_list") || "";
        }
    },
	_getExecutionId: function(versionId){
		return new global.ProminUtilsAJAX().getExecutionIdByVersion(versionId);
	},
    type: 'ProminPAUtil'
});
