(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

		var portalData = JSON.parse(event.parm1);

		var linkText = gs.getMessage("View the article in {0}", portalData.portalName);
		var knowledgeUrl = '/' + portalData.portalSuffix + '?id=kb_article_view&sysparm_article=' + current.number;

		template.print("<a title="+linkText+" href="+knowledgeUrl+">"+linkText+"</a>");

})(current, template, email, email_action, event);
