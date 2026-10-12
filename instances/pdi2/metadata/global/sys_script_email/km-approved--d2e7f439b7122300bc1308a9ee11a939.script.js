(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	
	var number = current.number;
	var short_desc = current.short_description;
	var article_link = gs.getProperty('glide.servlet.uri')+"nav_to.do?uri=kb_knowledge.do?sys_id="+current.sys_id;
	var author;
	var revisor = current.revised_by;
	if(revisor)
		author = revisor.first_name;
	else 
		author = current.author.first_name;
	
	var emailContent = {};
	emailContent.templateContent = 
		"Hi  "+author+",<br/>" + 
	"<br/>" +
	"<a href="+article_link+">"+number+"</a> is approved.<br/>" +
	"<br/>" +	
	"<b>Article Title</b>: "+short_desc+"<br/>" +
	"<br/>";	
	email.setSubject(number+" is approved.");
	template.print(emailContent.templateContent);
})(current, template, email, email_action, event);
