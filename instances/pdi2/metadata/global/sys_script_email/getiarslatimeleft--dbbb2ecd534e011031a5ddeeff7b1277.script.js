(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	
	var slaTimeLeft = AutoResolutionPortalHelper.getSLATimeLeft(current.sys_id);
    if (slaTimeLeft) {
        template.print(slaTimeLeft);
    }

})(current, template, email, email_action, event);
