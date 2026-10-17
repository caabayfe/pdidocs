function onLoad() {

	if (!CustomEventManager)
		return;

	// Add hints to breakpoints when the page loads, and each time the related lists are updated
	CustomEventManager.on("list_content_changed", addHintsToBreakpoints);
	CustomEventManager.on("page_loaded_fully", addHintsToBreakpoints);

	function addHintsToBreakpoints() {
		if (!jQuery || !GlideLists2)
			return;

		// Only apply hints in the "Test Step" related list
		var list = GlideLists2["sys_atf_test.sys_atf_step.test"];
		if (!list)
			return;

		var container = list.getContainer();
		if (!container)
			return;

		var hint = getMessage("ATF:breakpoint_hint");

		jQuery(".list2_cell_background", container).each(function() {
			// If something else already set the hint for this breakpoint/list element, don't clobber it
			if (!this.getAttribute("title"))
				this.setAttribute("title", hint);
		});
	}

}
