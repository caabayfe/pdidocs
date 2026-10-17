(function executeRule(current, previous /*null when async*/) {

	if (current.operation() == "update") {
        MacroTemplateCollectionManager.get().removeFromMacroTemplateAllowlist(previous.macroname);
	}

	MacroTemplateCollectionManager.get().addToMacroTemplateAllowlist(current.macroname);
	GlideClusterMessage.post("allowlist", "ReloadMacroTemplate");

})(current, previous);
