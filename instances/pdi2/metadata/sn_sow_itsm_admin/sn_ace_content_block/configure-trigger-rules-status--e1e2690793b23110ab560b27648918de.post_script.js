(function(context, pageParams, blockcontext, dataParams) {
    var inactiveCount = 0,
        activeCount = 0,
        count = 0;
    var gr = new GlideAggregate('major_incident_trigger_rule');
    gr.addAggregate('COUNT');
    gr.groupBy('active');
    gr.query();
    while (gr.next()) {
        var fieldValue = gr.getValue('active');
        if (fieldValue == "true") {
            activeCount = gr.getAggregate('COUNT');
        } else {
            inactiveCount = gr.getAggregate('COUNT');
        }
    }
    count = parseInt(activeCount) + parseInt(inactiveCount);
    var countStr = count.toString();
    var activeCountStr = activeCount.toString();

    if (count == 0) {
        context.props_details.html = sn_i18n.Message.getMessage("sn_sow_itsm_admin",
            "<span style='background-color: RGB(var(--now-color_grouped--purple-0, #EFDEFA)); border-radius: 2px; padding: 0px 4px 2px 2px;'>No rule configured</span>"
        );

    } else if (activeCount == 0) {
        context.props_details.html = sn_i18n.Message.getMessage(
            "sn_sow_itsm_admin",
            "<span style='background-color: RGB(var(--now-color_alert--positive-0, #CADFC0)); border-radius: 2px; padding: 0px 4px 2px 2px;'>{countVal} rule(s) configured, none active</span>", {
                countVal: countStr
            }
        );


    } else {
        context.props_details.html = sn_i18n.Message.getMessage(
            "sn_sow_itsm_admin",
            "<span style='background-color: RGB(var(--now-color_alert--positive-0, #CADFC0)); border-radius: 2px; padding: 0px 4px 2px 2px;'>{countVal} rule(s) configured, {activeVal} active</span>", {
                countVal: countStr,
                activeVal: activeCountStr
            }
        );

    }
})(context, pageParams, blockcontext, dataParams);
