function transform(input) {
    return evaluateKbAccessAndPrimaryAction(input);

    function evaluateKbAccessAndPrimaryAction(input) {
        const {
            currentRecordTable,
            currentRecordSysId,
            kbSysId
        } = input;
        let currentRecordGr = new GlideRecord(currentRecordTable);
        currentRecordGr.get(currentRecordSysId);

        // Return empty object if record is not valid or user do not have access
        if (!currentRecordGr.isValidRecord() || !currentRecordGr.canRead()) {
            return {};
        }

        // Default values if no extension point implementation is found
        let userHasKbAccess = true;
        let primaryActionByChannel = '';

        const extensionPoints = new GlideScriptedExtensionPoint().getExtensions('global.KnowledgeGuidanceUserResolver');
        for (const point of extensionPoints) {
            // Check if the current implementation matches the specified table name
            if (supportsTable(point, currentRecordTable)) {
                // Use the matching implementation to check user access
                userHasKbAccess = checkUserKbAccess(point, currentRecordGr, kbSysId);

                // Fetch the primary action based on the channel type
                primaryActionByChannel = getPrimaryAction(point, currentRecordGr);
                break;
            }
        }

        return {
            userHasKbAccess: userHasKbAccess,
            primaryActionByChannel: primaryActionByChannel,
        };
    }

    function supportsTable(point, table) {
        const supportedTables = point.getSupportedTables();
        return supportedTables && Array.isArray(supportedTables) && supportedTables.includes(table);
    }

    function checkUserKbAccess(point, currentRecordGr, kbSysId) {
        const result = point.getUsersForKbAccessCheck(currentRecordGr);
        const {
            userSysIds = [], requireAllUsersToHaveAccess = false,
        } = result || {};
        const knowledgeAPI = new global.KBCommon();

        if (userSysIds && Array.isArray(userSysIds) && userSysIds.length > 0) {
            let hasValidUserId = false;
            for (const userSysId of userSysIds) {
                if (!userSysId) continue;

                hasValidUserId = true;
                const hasAccess = knowledgeAPI.isViewAsUserHasArticleAccess(userSysId, kbSysId);

                // OR logic: Return true as soon as one user has access
                if (!requireAllUsersToHaveAccess && hasAccess) {
                    return true;
                }

                // AND logic: Return false as soon as one user does not have access
                if (requireAllUsersToHaveAccess && !hasAccess) {
                    return false;
                }
            }

            // - For AND logic: all users must have had access, so return true
            // - For OR logic: no user had access, so return false
            if (hasValidUserId)
                return requireAllUsersToHaveAccess;
        }

        // No valid user IDs were found or processed — fall back to guest access check
        return knowledgeAPI.checkGuestUserHasAccess(kbSysId);
    }

    function getPrimaryAction(point, currentRecordGr) {
        const channelType = currentRecordGr.getValue('contact_type');
        return point.getPrimaryActionByChannel(channelType);
    }

}
