(function process(/*ResolverEnvironment*/ env) {

    let chatWindowPositions = [];
	const interactionSysIds = env.getArguments()["sysIds"];
	if(typeof GlideScriptedExtensionPoint == "undefined") {
		gs.error(gs.getMessage("Unable to load scripted extension point for CloseChatWindowExtPoint"));
		return chatWindowPositions;
	}
	let chatWindowPositionExtPoints = new GlideScriptedExtensionPoint().getExtensions('CloseChatWindowExtPoint');

	for(var i=0; i < interactionSysIds.length; i++) {
		let interactionSysId = interactionSysIds[i];
		let position = getChatWindowPosition(interactionSysId);
		if(position) {
			let item = {
				sysId: interactionSysId,
				position: position
			};
			chatWindowPositions.push(item);
        }
    }
    return chatWindowPositions;

	function getChatWindowPosition(interactionSysId) {
		let position = "show";
		for(var i=0; i < chatWindowPositionExtPoints.length; i++) {
			try {
				chatWindowPositionExtPoint = chatWindowPositionExtPoints[i];
				if(!chatWindowPositionExtPoint.isValid(interactionSysId)) {
					continue;
				} else {
					const shouldCloseChatWindow = chatWindowPositionExtPoint.shouldCloseChatWindow(interactionSysId);
					if(shouldCloseChatWindow) {
						position = "hide";
					} else if(typeof chatWindowPositionExtPoint.isOutsideChatShell === "function") {
						const isOutsideChatShell = chatWindowPositionExtPoint.isOutsideChatShell(interactionSysId);
						position = isOutsideChatShell ? "outsideChatShell" : "show";
					}
					break;
				}
			} catch(e) {
				gs.error('Error from extension ' + extension.type + ', ' + e);
			}
		}
		return position;
	}
})(env);
