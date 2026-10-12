(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var obj = new JSON().decode(event.parm2);
	var article_link = new KBCommon().getArticleLink(obj.sys_id);
	email.setSubject("AQI Review for "+obj.display_number);
    template.print("Hi  "+obj.ownership_group+" member,<br/>");
	template.print("<br/>");
	template.print("An AQI review was performed on an article that you created/updated. The details are mentioned below.<br/>");
	template.print("<br/>");
	template.print("<b>Article</b> : <a href='"+article_link+ "'>"+obj.display_number+"</a><br/>");
	template.print("<b>Article Title</b> : "+obj.short_desc+"<br/>");
	template.print("<b>Authored/Updated</b> : "+obj.receiver_full_name+"<br/>");
	template.print("<b>Ownership Group</b> : "+obj.ownership_group+"<br/>");
	template.print("<b>AQI review performed on</b>: "+obj.review_completed_on+"<br/>");
	template.print("<b>AQI review performed by</b> : "+obj.reviewer+"<br/>");
	template.print("<br/>");
	template.print("<b>AQI Score</b> : "+obj.aqi_score+"<br/>");
	template.print("<b>Result</b> : "+obj.status+"<br/>");
	template.print("<b>Comments</b> : "+obj.comments+"<br/>");
	template.print("<br/>");	

})(current, template, email, email_action, event);
