(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var portal = gs.getProperty("sn_km_portal.glide.knowman.serviceportal.portal_url",'kb');
	
    template.print("Hi "+current.assigned_to.first_name+",<br/>");
	template.print("<br/>");
	template.print("A new feedback requires your action ");
	template.print("<a href='"+gs.getProperty('glide.servlet.uri')+ "kb_feedback_task.do?sys_id="+	current.sys_id + "'>"+ current.number +"</a><br/><br/>");
	template.print("<b>Article: </b>");
	template.print("<a href='"+gs.getProperty('glide.servlet.uri')+ "kb_knowledge.do?sys_id="+current.feedback.article + "'>"+current.feedback.article.getDisplayValue()+"</a><br/>");
	template.print("<b>Article Title</b>: "+current.feedback.article.short_description+"<br/>");
	template.print("<b>Reason:</b> "+current.feedback.reason.getDisplayValue()+"<br/>");
	template.print("<b>Description:</b> "+current.description+"<br/>");
	

})(current, template, email, email_action, event);
