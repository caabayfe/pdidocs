function onCondition() {
	getMessage("Upgrade group to manage all UX Form Actions in a single list. This simplifies controlling the display of actions within this group only, including their order, label, and icon. Once upgraded, actions will be managed through a m2m related list. Please note that this upgrade cannot be undone.", function(msg) { g_form.addInfoMessage(msg); } );
}
