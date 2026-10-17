function transform(input) {
	try {
		var errorCodeSysId = input.errorCodeSysId;
		var efActionutils = new global.EFActionUtils();

		var actions = efActionutils.getActions(errorCodeSysId);
		if (!actions)
			return null;

		return Array.isArray(actions) ?
			actions.map(action => ({
                id: action.sys_id,
                label: action.name,
                type: action.type,
                message: action.message,
                input: action.input
			})) : [];
	} catch (e) {
		throw gs.getMessage("Error while fetching actions: {0}", e.stack);
	}
}
