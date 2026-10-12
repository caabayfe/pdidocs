function onBefore(current, previous) {
	current.active = false;
	gs.addInfoMessage(gs.getMessage("Query rewrite deactivated due to field change. Set active to true to reactive this query rewrite."));
}
