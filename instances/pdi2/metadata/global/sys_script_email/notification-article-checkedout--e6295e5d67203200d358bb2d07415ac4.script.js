(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var obj = new JSON().decode(event.parm2);
	var article_link = new KBCommon().getArticleLink(obj.sys_id);
	email.setSubject("Reg: Article "+obj.number+ " has been checked out for revision by "+obj.revised_by);
    template.print("Hi  "+obj.receiver+",<br/>");
	template.print("<br/>");
	template.print("An article that you have created/updated in the past has been checked out for revision.<br/>");
	template.print("<br/>");
	template.print("<b>Article Number</b>: <a href='"+article_link+ "'>"+obj.number+"</a><br/>");
	template.print("<b>Article Title</b>: "+obj.short_desc+"<br/>");
	template.print("<b>Current Published Version</b>: "+obj.latest_version+"<br/>");
	template.print("<b>Checked Out By</b>: "+obj.revised_by+"<br/>");
	template.print("<b>Checked Out On</b>: "+obj.created_on+"<br/>");
	template.print("<br/>");
	template.print("This notification is for information purposes only. No action is required from you at this time.<br/>");

})(current, template, email, email_action, event);
