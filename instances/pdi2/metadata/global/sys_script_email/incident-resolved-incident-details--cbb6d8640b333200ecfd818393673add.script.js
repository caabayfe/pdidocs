(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var i18nSummary = gs.getMessage('Summary details');
	var i18nResolvedBy = gs.getMessage('Resolved by: {0}', '${resolved_by}');
	var i18nClosedNotes = gs.getMessage('Resolved notes: {0}', '${close_notes}');
	template.print('<p><font size="4" color="#808080" face="helvetica"><strong>' + i18nSummary + '</strong></font></p>');
	template.print('<p><font size="3" color="#808080" face="helvetica">' + i18nResolvedBy + '</font></p>');
	template.print('<p><font size="3" color="#808080" face="helvetica">' + i18nClosedNotes + '</font></p>');
})(current, template, email, email_action, event);
