(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    // Add your code here
    // Check if getGlideURI contains 'email_client.do', which is used for rendering email templates within an iframe.  
    // Note: This feature is not currently supported for Gen AI.
    var glideUri = gs.action.getGlideURI() + '';
    var hasEmailClient = glideUri.includes('email_client.do');

    var pluginManager = new GlidePluginManager();
    var defaultResolution = current.incident_alert.source_incident.close_notes;
    if (!hasEmailClient && pluginManager.isActive('sn_itsm_gen_ai')) {
		var genAiUtils = new sn_itsm_gen_ai.NowAssistItsmGenAIUtils();
        var isMimCommSkillEnabled = genAiUtils.userCanExecuteInProductSkill(genAiUtils.MIM_COMM_CONFIG.CAPABILITY_ID, genAiUtils.MIM_COMM_CONFIG.TABLE, current.getUniqueValue(), genAiUtils.MIM_COMM_CONFIG.CONTEXT);
        var resolutionContent = isMimCommSkillEnabled ?
            genAiUtils.updateMimResponse("resolve",current, template, email, email_action, event) :
            defaultResolution;

        template.print(resolutionContent);
    } else {
        template.print(defaultResolution);
    }

})(current, template, email, email_action, event);
