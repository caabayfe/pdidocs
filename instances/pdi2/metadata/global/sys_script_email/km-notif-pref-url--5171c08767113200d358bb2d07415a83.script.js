(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var portal = gs.getProperty('sn_km_portal.glide.knowman.serviceportal.portal_url') || 'sp';
	template.print("<a title='Notification Preferences' href='"+gs.getProperty('glide.servlet.uri')+portal+"?id=actsub_notif_pref&sysparm_domain_restore=false&sysparm_stack=no'>here</a>");
})(current, template, email, email_action, event);
