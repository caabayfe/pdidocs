(function(context, pageParams, blockcontext) {
    var miTriggerRuleGR = new GlideAggregate('major_incident_trigger_rule');
    miTriggerRuleGR.addAggregate('COUNT');
    miTriggerRuleGR.query();
    var count = 0;
    if (miTriggerRuleGR.next()) {
        count = miTriggerRuleGR.getAggregate('COUNT');
    }
    if (count > 0) {
        return {
            listRecordCount: count,
            showEmptyState: false,
            showList: true
        };
    } else {
        return {
            listRecordCount: count,
            showEmptyState: true,
            showList: false
        };
    }
})(context, pageParams, blockcontext);
