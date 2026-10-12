(function executeRule(current, previous /*null when async*/) {

	MacroTemplateCollectionManager.get().removeFromMacroTemplateAllowlist(current.macroname);
	GlideClusterMessage.post("script", "MacroTemplateCollectionManager.get().removeFromMacroTemplateAllowlist('" + current.macroname + "');");
   

})(current, previous);
