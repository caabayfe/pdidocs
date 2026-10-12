(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	
	var obj = new KBKnowledge().getNotificationObject(current);
	var emailContent = {};
	emailContent.templateContent = 
		"Hi  "+obj.approver+",<br/>" + 
	"<br/>" +
	"<a href="+obj.article_link+">"+obj.number+"</a> is awaiting approval.<br/>" +
	"<br/>" +
	"<b>Article Title</b>: "+obj.short_desc+"<br/>" +
	"<br/>" +
	"Please review the article and <a href="+obj.approval_link+">Approve/Reject</a>	it<br/>" +
	"<br/>";	
	email.setSubject(obj.number+" is awaiting approval.");
	template.print(emailContent.templateContent);
	
})(current, template, email, email_action, event);
