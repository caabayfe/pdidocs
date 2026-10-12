(function(context, pageParams, blockcontext){
    var ans, response_status_html;
    var configSettingsGR = new GlideRecord('sn_sow_cfg_stg');
    configSettingsGR.get('d40d11f693465210c3bbf04e648918c1');
    ans = configSettingsGR.getValue('value') == 'true';

    if (ans == false)
        response_status_html = sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<span style=\"background-color: RGB(var(--now-color_grouped--purple-0, #EFDEFA)); border-radius: 2px; padding: 0px 4px 2px 2px;\">Needs review</span>");
    else
        response_status_html = sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<span style=\"background-color: RGB(var(--now-color_alert--positive-0, #CADFC0)); border-radius: 2px; padding: 0px 4px 2px 2px;\">Properties configured</span>");
    return {
        isPropertiesConfigured: ans,
        incidentPropertiesStatus: response_status_html
    };
})(context, pageParams, blockcontext);
