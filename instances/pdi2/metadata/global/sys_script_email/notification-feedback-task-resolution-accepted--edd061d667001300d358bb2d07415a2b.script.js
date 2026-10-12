(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var portal = gs.getProperty("sn_km_portal.glide.knowman.serviceportal.portal_url",'kb');
	
    template.print("Hi "+event.parm2+",<br/>");
	template.print("<br/>");
	template.print("The resolution proposed for feedback ");
	template.print("<a href='"+gs.getProperty('glide.servlet.uri')+ "kb_feedback_task.do?sys_id="+	current.sys_id + "'>"+ current.number +"</a>");
	template.print(" was accepted by "+ current.opened_by.getDisplayValue() +"<br/>");

})(current, template, email, email_action, event);
