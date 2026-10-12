(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var obj = new JSON().decode(event.parm2);
	var article_link = new KBCommon().getArticleLink(obj.article_id);
	var emailContent = {};
	emailContent.templateContent = 

    "Hi  "+obj.receiver+",<br/>" + 
	"<br/>" +
	"An article that you have created/updated has received a new comment.<br/>" + 
	"<br/>" + 
	"<b>Article Number</b>: <a href='"+article_link+ "'>"+obj.article_number+"</a><br/>" +
	"<b>Article Title</b>: "+obj.short_desc+"<br/>" +
	"<b>Commented By</b>: "+obj.commented_by+"<br/>" +
	"<b>Received On</b>: "+obj.commented_on+"<br/>" +
	"<b>Comment</b>: "+obj.comment+"<br/>" +
	"<br/>" +
	"If this comment requires you to update the article, you may do so from " +
	"<a href='"+gs.getProperty('glide.servlet.uri')+"kb_knowledge.do?sys_id="+	obj.latest_version_id +"'>here.</a><br/>";
	
	var vars={
		url: gs.getProperty('glide.servlet.uri'),
		articleobj : obj
		};
    var extensionPoint = new GlideUIExtensionPoint().getExtensions("global.KMFeedbackNotification", vars);
    if(extensionPoint.length > 0){
       emailContent.templateContent = extensionPoint[0];
     }
	email.setSubject(obj.subject);
	template.print(emailContent.templateContent);
	

})(current, template, email, email_action, event);
