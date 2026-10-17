(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

    var rosterSpanProposalGr = new GlideRecord("roster_schedule_span_proposal");
	if (rosterSpanProposalGr.get(current.document_id + "")) {
		var proposedCover = rosterSpanProposalGr.getDisplayValue("proposed_cover");
		if (proposedCover)
			template.print(gs.getMessage("During this time, the shifts will be covered by {0}.", proposedCover));
	}

})(current, template, email, email_action, event);
