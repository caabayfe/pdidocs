(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var obj = new JSON().decode(event.parm2);
	var article_link = new KBCommon().getArticleLink(obj.article_id);
	email.setSubject("Reg: Article "+obj.article_number+ " has been commented on "+obj.commented_on);
    template.print("Hi  "+obj.ownership_group_name+" member,<br/>");
	template.print("<br/>");
	template.print("An article that you have created/updated has received a new comment.<br/>");
	template.print("<br/>");
	template.print("<b>Article Number</b>: <a href='"+article_link+ "'>"+obj.article_number+"</a><br/>");
	template.print("<b>Article Title</b>: "+obj.short_desc+"<br/>");
	template.print("<b>Commented By</b>: "+obj.commented_by+"<br/>");
	template.print("<b>Received On</b>: "+obj.commented_on+"<br/>");
	template.print("<b>Comment</b>: "+obj.comment+"<br/>");
	template.print("<br/>");
	template.print("If this comment requires you to update the article, you may do so from ");
	template.print("<a href='"+gs.getProperty('glide.servlet.uri')+"kb_knowledge.do?sys_id="+	obj.latest_version_id + "'>here.</a><br/>");
	

})(current, template, email, email_action, event);
