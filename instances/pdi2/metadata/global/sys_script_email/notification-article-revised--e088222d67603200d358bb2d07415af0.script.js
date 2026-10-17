(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

    var obj = new JSON().decode(event.parm2);
	var article_link = new KBCommon().getArticleLink(obj.sys_id);
	email.setSubject("Reg: Article "+obj.number+" has been revised");
    template.print("Hi  "+obj.receiver+",<br/>");
	template.print("<br/>");
	template.print("A new version of ");
	template.print("<a href='"+article_link+ "'>"+obj.number+"</a> ( "+ obj.short_desc +" )");
	template.print(" has been published on "+obj.updated_on+".<br/>");

})(current, template, email, email_action, event);
