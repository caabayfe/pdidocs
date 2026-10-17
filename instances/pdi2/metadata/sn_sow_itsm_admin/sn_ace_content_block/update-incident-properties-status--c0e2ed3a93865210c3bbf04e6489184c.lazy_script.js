(function(context, pageParams, blockcontext) {
    var configSettingsGR = new GlideRecord('sn_sow_cfg_stg');
    configSettingsGR.get('d40d11f693465210c3bbf04e648918c1');
    configSettingsGR.setValue('value', true); //update the configuration setting
    if (configSettingsGR.update())
        return {
            isPropertiesConfigured: true,
            incidentPropertiesStatus: sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<span style=\"background-color: RGB(var(--now-color_alert--positive-0, #CADFC0)); border-radius: 2px; padding: 0px 4px 2px 2px;\">Properties configured</span>")

        };
    else
        return {
            isPropertiesConfigured: false
        };
})(context, pageParams, blockcontext);
