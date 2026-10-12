(function process(/*ResolverEnvironment*/ env) {

    var shouldClose = false;
    var interactionSysId = env.getArguments()["sysId"];
    if (typeof GlideScriptedExtensionPoint == "undefined") {
		gs.info(gs.getMessage("Unable to load extension CloseChatWindowExtPoint"));
		return false;
	}
	var registeredExtensions = new GlideScriptedExtensionPoint().getExtensions('CloseChatWindowExtPoint');
	for (var i = 0; i < registeredExtensions.length; ++i) {
		try {
			var extension = registeredExtensions[i];
			if (!extension.isValid(interactionSysId))
				continue;
			else {
				shouldClose = extension.shouldCloseChatWindow(interactionSysId);
				break;
			}
		} catch(e) {
			gs.error('Error from extension ' + extension.type + ', ' + e);
		}
	}

	return shouldClose;

})(env);
