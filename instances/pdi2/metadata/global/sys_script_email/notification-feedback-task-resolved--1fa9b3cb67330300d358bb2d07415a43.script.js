(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var portal = gs.getProperty("sn_km_portal.glide.knowman.serviceportal.portal_url",'kb');
	
    template.print("Hi "+current.opened_by.first_name+",<br/>");
	template.print("<br/>");
	template.print("The feedback you submitted ");
	template.print("<a href='"+gs.getProperty('glide.servlet.uri')+ portal  + "?id=form&table=kb_feedback_task&sys_id="+	current.sys_id + "'>"+ current.number +"</a>");
	template.print(" was resolved. Please review and accept.");

})(current, template, email, email_action, event);
