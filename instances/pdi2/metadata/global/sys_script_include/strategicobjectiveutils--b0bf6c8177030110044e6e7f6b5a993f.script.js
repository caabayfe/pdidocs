var StrategicObjectiveUtils = Class.create();
StrategicObjectiveUtils.prototype = {
    initialize: function() {},

    canShowNewButton: function(sysParamTargetValue) {
		if(JSUtil.nil(sysParamTargetValue))
			return true;
		
		var formTable = String(sysParamTargetValue).split(".")[0];
        var gr = new GlideRecord(formTable);
		//We donot want the user to create new Strategic Objectives from Work Item(Project,Demand) forms as we allow only Enterprise and BU Strategic objectives to be added when navigated through reference of work item forms.
		if(gr.instanceOf("pm_project") || gr.instanceOf("dmn_demand"))
			return false;
		
		return true;
    },

    type: 'StrategicObjectiveUtils'
};
