(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	
	var portal = gs.getProperty("sn_km_portal.glide.knowman.serviceportal.portal_url",'kb');
	
    template.print("Hi "+current.assigned_to.first_name+",<br/>");
	template.print("<br/>");
	template.print("A new update was received to a feedback ");
	template.print("<a href='"+gs.getProperty('glide.servlet.uri')+ "kb_feedback_task.do?sys_id="+	current.sys_id + "'>"+ current.number +"</a>");
	template.print(" you are handling:<br/><br/>");
	template.print("Comments: ${comments}");

})(current, template, email, email_action, event);
