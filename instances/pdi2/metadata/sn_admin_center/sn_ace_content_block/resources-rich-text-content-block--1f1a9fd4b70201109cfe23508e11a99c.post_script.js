(function(context) {
    /*
    	context = {
    		'block_id': @sysId,
    		'name': @String,
    		'title': @String,
    		'subtitle': @String,
    		'order': @Number,
    		'type': @Object,
    		'children': @Array[context],
    		'props_details': @Object
    	};
    */
    //put your code here
    var vars = {};
    var businessObjectiveId = context.pageParams.businessObjectiveId;
    var usefulTips = getBusinessObjectiveUsefulTips(businessObjectiveId);
    vars['usefulTips'] = usefulTips;
    context.props_details.vars = JSON.stringify(vars);

    function getBusinessObjectiveUsefulTips(businessObjectiveId) {
        var adminCenterBusinessObjective = new GlideRecord('sn_admin_center_business_objective');

        // ToDo: Handle no business objective record found
        if (!adminCenterBusinessObjective.get(businessObjectiveId))
            return '';

        var usefulTips = adminCenterBusinessObjective.useful_tips ? adminCenterBusinessObjective.useful_tips.getDisplayValue() : "";
        return usefulTips;
    }

})(context);
