(function(context, pageParams, blockcontext, dataParams) {
    var inactiveCount = 0,
        activeCount = 0,
        count = 0;
    var emailActionGA = new GlideAggregate('sysevent_email_action');
    //Considering email notification with Category as Major Incident Management or Incident Communication Task
    emailActionGA.addEncodedQuery('category=502bc41043d88a1061ef038dd9b8f2ad^ORcategory=147acf3d5be81300e3cc8e6541f91ac7');
    emailActionGA.addAggregate('COUNT');
    emailActionGA.groupBy('active');
    emailActionGA.query();
    while (emailActionGA.next()) {
        var fieldValue = emailActionGA.getValue('active');
        if (fieldValue == "true") {
            activeCount = emailActionGA.getAggregate('COUNT');
        } else {
            inactiveCount = emailActionGA.getAggregate('COUNT');
        }
    }
    count = parseInt(activeCount) + parseInt(inactiveCount);
    var countStr = count.toString();
    var activeCountStr = activeCount.toString();
    if (count == 0) {
        context.props_details.html = sn_i18n.Message.getMessage("sn_sow_itsm_admin",
            "<span style='background-color: RGB(var(--now-color_grouped--purple-0, #EFDEFA)); border-radius: 2px; padding: 0px 4px 2px 2px;'>No notification configured</span>"
        );

    } else if (activeCount == 0) {
        context.props_details.html = sn_i18n.Message.getMessage(
            "sn_sow_itsm_admin",
            "<span style='background-color: RGB(var(--now-color_alert--warning-0, #FBF7BF)); border-radius: 2px; padding: 0px 4px 2px 2px;'>{countVal} notification(s) configured, none active</span>", {
                countVal: countStr
            }
        );


    } else {
        context.props_details.html = sn_i18n.Message.getMessage(
            "sn_sow_itsm_admin",
            "<span style='background-color: RGB(var(--now-color_alert--positive-0, #CADFC0)); border-radius: 2px; padding: 0px 4px 2px 2px;'>{countVal} notification(s) configured, {activeVal} active</span>", {
                countVal: countStr,
                activeVal: activeCountStr
            }
        );

    }
})(context, pageParams, blockcontext, dataParams);
