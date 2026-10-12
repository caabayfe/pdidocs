function resolveRelatedIncidents() {
	var textArea = $("close_notes_text");
	if (textArea)
		resolveIncidents(textArea.value.trim());
}

(function() {
	var doctypeEnabled = document.documentElement.getAttribute('data-doctype') == 'true';
	var notes = resolveConfirmCancelDialog.getPreference("sysparm_notes");
	var notesElem = $("close_notes_text");
	if (!notesElem)
		return;
	if (notes) {
		notesElem.setValue(notes);
		if (doctypeEnabled) {
			var parentDiv = $("element.close_notes_text");
			if (parentDiv) {
				parentDiv.removeClassName("is-required");
				parentDiv.addClassName("is-prefilled");
			}
		} else {
			var statusSpan = $("status.close_notes_text");
			if (statusSpan) {
				statusSpan.removeClassName("mandatory");
				statusSpan.addClassName("mandatory_populated");
			}
		}
		var button = $("resolve_ok_btn");
		if (button) {
			button.removeClassName("disabled");
			button.onclick = resolveRelatedIncidents;
		}
	}
	notesElem.focus();
})();
