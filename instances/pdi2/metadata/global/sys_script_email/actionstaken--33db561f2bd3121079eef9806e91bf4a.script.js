(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    // Add your code here
    function printActionsTaken() {
        var activities = current.incident_alert.source_incident.actions_taken.getJournalEntry(3);
        var activityArray = activities.split("\n\n");
        template.print("<br/>");
        for (var i = 0; i < activityArray.length; i++) {
            template.print(activityArray[i] + "<br/>");
        }
    }
    // Check if getGlideURI contains 'email_client.do', which is used for rendering email templates within an iframe.  
    // Note: This feature is not currently supported for Gen AI.
    var glideUri = gs.action.getGlideURI() + '';
    var hasEmailClient = glideUri.includes('email_client.do');

    var pluginManager = new GlidePluginManager();
    if (!hasEmailClient && pluginManager.isActive('sn_itsm_gen_ai')) {
        var genAiUtils = new sn_itsm_gen_ai.NowAssistItsmGenAIUtils();
        var isMimCommSkillEnabled = genAiUtils.userCanExecuteInProductSkill(genAiUtils.MIM_COMM_CONFIG.CAPABILITY_ID, genAiUtils.MIM_COMM_CONFIG.TABLE, current.getUniqueValue(), genAiUtils.MIM_COMM_CONFIG.CONTEXT);

        if (isMimCommSkillEnabled) {
            var actionTaken = genAiUtils.updateMimResponse("actionsTaken", current, template, email, email_action, event);
            template.print(actionTaken);
        } else {
            printActionsTaken();
        }
    } else {
        printActionsTaken();
    }

})(current, template, email, email_action, event);
