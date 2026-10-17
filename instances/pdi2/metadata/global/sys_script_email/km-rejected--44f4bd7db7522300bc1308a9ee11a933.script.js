(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var number = current.number;
	var rejectNotes = "";
	var short_desc = current.short_description;
	var article_link = gs.getProperty('glide.servlet.uri')+"nav_to.do?uri=kb_knowledge.do?sys_id="+current.sys_id;
	var author;
	var revisor = current.revised_by;
	if(revisor)
		author = revisor.first_name;
	else
		author = current.author.first_name;
	var lastComment, lastCommentLines;
	var approval = new GlideRecord("sysapproval_approver");
	approval.addQuery("document_id",current.sys_id);
	approval.addQuery("state","rejected");
	approval.query();
	if (approval.next()) {
		lastComment = approval.comments.getJournalEntry(1);
		lastCommentLines = lastComment.split("\n");
		lastCommentLines.shift();
		rejectNotes = lastCommentLines.join('<br/>');
	}
	var emailContent = {};
	emailContent.templateContent =
		"Hi  "+author+",<br/>" +
	"<br/>" +
	"<a href="+article_link+">"+number+"</a> is rejected.<br/>" +
	"<br/>" +
	"<b>Article Title</b>: "+short_desc+"<br/>" +
	"<br/>" +
	"<b>Rejection comments</b>: "+rejectNotes+"<br/>" +
    "<br/>" +
	"Please visit the article link if you want to revise the article.<br/>" +
	"<br/>";
	email.setSubject(number+" is rejected.");
	template.print(emailContent.templateContent);
})(current, template, email, email_action, event);
