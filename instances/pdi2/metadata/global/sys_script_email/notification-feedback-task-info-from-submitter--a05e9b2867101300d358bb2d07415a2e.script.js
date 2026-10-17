(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	
	var portal = gs.getProperty("sn_km_portal.glide.knowman.serviceportal.portal_url",'kb');
	var article_link = new KBCommon().getArticleLink(current.feedback.article);
    template.print("Hi "+current.opened_by.first_name+",<br/>");
	template.print("<br/>");
	template.print("We need more information in order to process your feedback on article ");
	template.print("<a href='"+article_link+"'>"+current.feedback.article.getDisplayValue()+"</a><br/><br/>");
	template.print("<b>Article Title</b>: "+current.feedback.article.short_description+"<br/>");
	template.print("Please click <a href='"+gs.getProperty('glide.servlet.uri')+ portal +"?id=form&table=kb_feedback_task&sys_id="+	current.sys_id + "'> here </a>");
	template.print(" to proceed.");

})(current, template, email, email_action, event);
