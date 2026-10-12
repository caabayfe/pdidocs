(function executeRule(current, previous /*null when async*/ ) {
    var shouldCreateRecrods = gs.getProperty('sn_va_slack.enable_slack_branding', 'false') == 'true';
    if (shouldCreateRecrods && GlidePluginManager.isActive('sn_va_slack')) {
        var slackBotConfig = new SlackBotConfig();
        var inboundId = slackBotConfig.getInboundId(current.message_auth);
        if (slackBotConfig.isProductionBot(inboundId)) {

            var gr = new GlideRecord("sys_cs_custom_adapter_property");
            gr.initialize();
            gr.setValue('name', 'bot_name');
            gr.setValue('document_record', current.getUniqueValue());
            gr.setValue('document_table', 'sys_cs_provider_application');
            gr.insert();

            var gr1 = new GlideRecord('sys_cs_custom_adapter_property');
            gr1.initialize();
            gr1.setValue('name', 'bot_icon');
            gr1.setValue('document_record', current.getUniqueValue());
            gr1.setValue('document_table', 'sys_cs_provider_application');
            gr1.insert();

            var imgName = 'slack_' + current.getUniqueValue() + '.png';
            var gr2 = new GlideRecord('db_image');
            gr2.initialize();
            gr2.setValue('name', imgName);
            gr2.insert();


        }

    }



})(current, previous);
