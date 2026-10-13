//insert state handling is not required in BR as it is specified in default value
if (current.state.changesTo("closed")) {
	current.closed_at = new GlideDateTime().getDisplayValue();
	current.closed_by = gs.getUserID();
}
