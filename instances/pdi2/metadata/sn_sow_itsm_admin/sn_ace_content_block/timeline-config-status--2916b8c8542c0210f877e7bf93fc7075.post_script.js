(function(context, pageParams, blockcontext, dataParams) {
    var status = new sn_sow_itsm_admin.SOWAdminConfigUtils().isActiveConfiguration('timeline_settings');

    if (status) {
        context.props_details.html = sn_i18n.Message.getMessage("sn_sow_itsm_admin","<span style='background-color: RGB(var(--now-color_alert--positive-0, #CADFC0)); border-radius: 2px; padding: 0px 4px 2px 2px;'>Default settings configured</span>");
    } else {
        context.props_details.html = sn_i18n.Message.getMessage("sn_sow_itsm_admin",
            "<span style='background-color: RGB(var(--now-color_grouped--purple-0, #EFDEFA)); border-radius: 2px; padding: 0px 4px 2px 2px;'>No default settings configured</span>"
        );
    }
})(context, pageParams, blockcontext, dataParams);
