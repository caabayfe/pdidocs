(function executeRule(current, previous /*null when async*/) {

    // This BR triggers on all INSERT/UPDATE/DELETE of native client
    // Script handles filtering internally for relevant scenarios:
    // 1. INSERT of native client with experience attached
    // 2. UPDATE when aiux_web_experience field changes (including removal)
    // 3. UPDATE when type field changes
    // 4. UPDATE when order field changes
    // 5. DELETE of native client with experience
    // URL suffix changes are handled by the sys_aix_experience BR (updates regex only)

    var manager = new AiuxUniversalLinkManager();
    var operation = current.operation();
    var hasExperience = !current.aiux_web_experience.nil();
    var hadExperience = previous && !previous.aiux_web_experience.nil();

    // Handle DELETE - cleanup entries if had experience
    if (operation == 'delete') {
        if (hasExperience) {
            var delType = current.getValue('type');
            var delExpId = current.getValue('aiux_web_experience');
            if (delType && delExpId) {
                manager.cleanupOrphanedEntries(delType, delExpId);
                gs.info('AIUX Native Client BR: Cleaned up entries for deleted native client ' + current.getUniqueValue());
            }
        }
        return;
    }

    // Handle experience removal (was set, now empty)
    if (!hasExperience && hadExperience) {
        var oldType = previous.getValue('type');
        var oldExpId = previous.getValue('aiux_web_experience');
        if (oldType && oldExpId) {
            manager.cleanupOrphanedEntries(oldType, oldExpId);
            gs.info('AIUX Native Client BR: Cleaned up entries after experience removed from native client ' + current.getUniqueValue());
        }
        return;
    }

    // Skip if no experience (INSERT without experience or UPDATE of unrelated fields)
    if (!hasExperience) {
        return;
    }

    var isUpdate = operation != 'insert';

    // For updates, check if relevant fields changed
    if (isUpdate && previous) {
        var typeChanged = current.getValue('type') !== previous.getValue('type');
        var expChanged = current.getValue('aiux_web_experience') !== previous.getValue('aiux_web_experience');
        var orderChanged = current.getValue('order') !== previous.getValue('order');

        // Skip if no relevant fields changed
        if (!typeChanged && !expChanged && !orderChanged) {
            return;
        }

        // Cleanup orphaned entries if type or experience changed
        if ((typeChanged || expChanged) && hadExperience) {
            var oldType = previous.getValue('type');
            var oldExpId = previous.getValue('aiux_web_experience');
            if (oldType && oldExpId) {
                manager.cleanupOrphanedEntries(oldType, oldExpId);
            }
        }
    }

    // Create/update entries for current values
    var result = manager.createUniversalLinkEntries(current);

    var opLabel = isUpdate ? 'Updated' : 'Created';

    if (!result.success) {
        gs.warn('AIUX Native Client BR: Failed to create/update universal link entries for native client ' + 
                current.getUniqueValue() + ': ' + result.error);
    } else {
        gs.info('AIUX Native Client BR: ' + opLabel + ' universal link entries for native client ' + 
                current.getUniqueValue() + 
                ' - PathSegment: ' + result.pathSegmentId + 
                ', SupportedUrl: ' + result.supportedUrlId);
    }

})(current, previous);
