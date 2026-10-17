// eslint-disable-next-line no-unused-vars
function policy({ trigger, properties, api }) {
	const { language, disableDebugging, editorMode } = properties;

	function languageUpdates() {
		const isJS = language === 'javascript';
		api.updateVisibility('isClientScript', isJS);
		api.updateVisibility('scope', isJS);
		api.updateSectionVisibility('debugging', isJS);
		api.updateSectionVisibility('autocomplete', isJS);

		const isJSON = language === 'json';
		api.updateSectionVisibility('others', isJSON);
	}

	function disableDebuggingUpdates() {
		const isDebugging = disableDebugging === false;
		api.updateVisibility('recordType', isDebugging);
		api.updateVisibility('scriptField', isDebugging);
		api.updateVisibility('sysId', isDebugging);
	}

	function editorModeUpdates() {
		const enableDiffEditor = editorMode === 'diff_editor';
		api.updateVisibility('originalContent', enableDiffEditor);
		api.updateVisibility('disableToggleDiffView', !enableDiffEditor);
	}

	// Initial load
	if (!trigger) {
		languageUpdates();
		disableDebuggingUpdates();
		editorModeUpdates();
	} else if (trigger === 'language') languageUpdates();
	else if (trigger === 'disableDebugging') disableDebuggingUpdates();
	else if (trigger === 'editorMode') editorModeUpdates();
}
