function transform(input) {
    try {
        // Parse the properties array if it's a string
        var propertiesToUpdate = input.properties;
        if (typeof propertiesToUpdate === 'string') {
            propertiesToUpdate = JSON.parse(propertiesToUpdate);
        }

        // Validate input
        if (!propertiesToUpdate || !Array.isArray(propertiesToUpdate)) {
            gs.error(gs.getMessage("[Update Knowledge Management Properties] Invalid input properties must be an array"));
            return {
                success: false
            };
        }

        //Call the script include to update properties
        var kmPropManager = new global.GlobalKnowledgeUtilSNC();
        var result = kmPropManager.updateProperties(propertiesToUpdate);
        if (result && result.success) {
            return {
                success: true,
                message: gs.getMessage("Properties updated")
            };
        } else {
            gs.error(gs.getMessage("[Update Knowledge Management Properties] Failed to update properties"));
            return {
                success: false,
				message: gs.getMessage("Failed to update")
            };
        }
    } catch (e) {
        gs.error(gs.getMessage("[Update Knowledge Management Properties] Exception: {0}", [e]));
        return {
            success: false
        };
    }
}
