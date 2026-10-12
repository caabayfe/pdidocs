(function runMailScript(current, template, email, email_action, event) {
	var i18nSummary = gs.getMessage('Summary details');
	var i18nClosedBy = gs.getMessage('Closed by: {0}', '${closed_by}');
	var i18nClosedNotes = gs.getMessage('Closed notes: {0}', '${close_notes}');
	template.print('<p><font size="4" color="#808080" face="helvetica"><strong>' + i18nSummary + '</strong></font></p>');
	template.print('<p><font size="3" color="#808080" face="helvetica">' + i18nClosedBy + '</font></p>');
	template.print('<p><font size="3" color="#808080" face="helvetica">' + i18nClosedNotes + '</font></p>');
})(current, template, email, email_action, event);
