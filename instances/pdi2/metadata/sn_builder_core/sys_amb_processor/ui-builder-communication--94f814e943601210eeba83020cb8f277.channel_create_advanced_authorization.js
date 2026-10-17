function /*boolean*/ authorizeCreate(/*String*/ channel, /*String*/ user) {
	return gs.hasRole('ui_builder_admin') || UIBScriptables.isDDUserWithUIBuilderPermission();
}
