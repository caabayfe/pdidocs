(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var obj = new JSON().decode(event.parm2);
	var article_link = new KBCommon().getArticleLink(obj.sys_id);
	email.setSubject("Reg: A new article "+obj.number+" has been published in "+obj.knowledge_base+" Knowledge Base.");
    template.print("Hi  "+obj.receiver+",<br/>");
	template.print("<br/>");
	template.print("An article has been published in the "+obj.knowledge_base+" Knowledge Base.<br/>");
	template.print("<br/>");
	template.print("<b>Article Number</b>: <a href='"+article_link+ "'>"+obj.number+"</a><br/>");
	template.print("<b>Article Title</b>: "+obj.short_desc+"<br/>");
	template.print("<b>Published Date</b>: "+obj.created_on+"<br/>");

})(current, template, email, email_action, event);
