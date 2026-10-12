function /*boolean*/ authorizeSend(/*String*/ channel, /*Map<String, Object>*/ message, /*String*/ sender) {
	return gs.hasRole('ui_builder_admin') || UIBScriptables.isDDUserWithUIBuilderPermission();
}
