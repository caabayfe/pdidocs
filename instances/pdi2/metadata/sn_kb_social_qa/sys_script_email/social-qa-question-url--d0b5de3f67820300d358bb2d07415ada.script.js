(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
		  var instance_url = gs.getProperty('glide.servlet.uri');
          template.print("<a title='View Question' href='"+ instance_url + "$social_qa.do?sysparm_view=question&amp;sysparm_question_id="+ current.question.sys_id + "' target=_blank>View Question</a>");

})(current, template, email, email_action, event);
