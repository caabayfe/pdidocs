(function executeRule(current, previous) {
	const locals = JSON.parse(current.locals);
	const nestedPlaybookContextId = locals.launch_nested_process_context_id;
	const nestedPlaybookContext = new GlideRecord(PDConstants.TABLES.PD_CONTEXT);
	if (!nestedPlaybookContextId || !nestedPlaybookContext.get(nestedPlaybookContextId)) {
		gs.warn(gs.getMessage("Unable to get nested playbook with context id {0} during cancellation.", nestedPlaybookContextId));
		return;
	}

	// Normally an AC is In-Progress while it is being canceled
	// We also want to leave the AC state to CANCELLED for complete
	// once restart, which is when the nested playbook context id is missing.
	// That is why this line is after the above check.
	current.state = PDConstants.STATE_VALUES.IN_PROGRESS;

	const cancelResult = sn_playbook.PlaybookExperience.cancelPlaybook(
		nestedPlaybookContext,
		gs.getMessage("Nested playbook cancelled by parent playbook {0}", current.context.label)
	);

	if (cancelResult?.errors?.length > 0) {
		gs.error(gs.getMessage("Error occurred while trying to cancel nested playbook: \n{0}", JSON.stringify(cancelResult.errors)));
	}
})(current, previous);
