(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

    var obj = new JSON().decode(event.parm2);
	var article_link = new KBCommon().getArticleLink(obj.sys_id);
	email.setSubject("Reg: Article "+obj.number+" has been revised");
    template.print("Hi  "+obj.receiver+",<br/>");
	template.print("<br/>");
	template.print("An article has been revised in the "+obj.knowledge_base+" Knowledge Base.<br/>");
	template.print("<br/>");
	template.print("<b>Article Number</b>: <a href='"+article_link+ "'>"+obj.number+"</a><br/>");	
	template.print("<b>Article Title</b>: "+obj.short_desc+"<br/>");
	template.print("<b>Revised Date</b>: "+obj.updated_on+".<br/>");

})(current, template, email, email_action, event);
