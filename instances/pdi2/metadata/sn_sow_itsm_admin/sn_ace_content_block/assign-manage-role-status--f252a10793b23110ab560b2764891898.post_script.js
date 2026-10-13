(function(context, pageParams, blockcontext, dataParams) {
    var count = 0;
    var gr = new GlideAggregate('sys_user_has_role');
    gr.addQuery('role.name', 'major_incident_manager');
    gr.addAggregate('COUNT');
    gr.query();
    if (gr.next()) {
        count = gr.getAggregate('COUNT');
    }
    var countStr = count.toString();
    if (count > 0) {
        context.props_details.html = sn_i18n.Message.getMessage(
            "sn_sow_itsm_admin",
            "<span style='background-color: RGB(var(--now-color_alert--positive-0, #CADFC0)); border-radius: 2px; padding: 0px 4px 2px 2px;'>{countVal} user(s) assigned the Manager role</span>", {
                countVal: countStr
            }
        );
    } else {
        context.props_details.html = sn_i18n.Message.getMessage("sn_sow_itsm_admin",
            "<span style='background-color: RGB(var(--now-color_grouped--purple-0, #EFDEFA)); border-radius: 2px; padding: 0px 4px 2px 2px;'>No user assigned the Manager role</span>"
        );

    }

})(context, pageParams, blockcontext, dataParams);
