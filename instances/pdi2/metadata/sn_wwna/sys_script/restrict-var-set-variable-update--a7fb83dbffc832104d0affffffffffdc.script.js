(function executeRule(current, previous /*null when async*/ ) {
    if (!gs.hasRole('maint')) {
        var skillConfigId = current.getValue('skill_config');
        var adminConfigs = new sn_wwna.NAAWWNAUtils().fetchAdminConfigs(skillConfigId);
        if (adminConfigs.shouldDisableFields) {
            var disabledKeys = Object.keys(adminConfigs.fieldToDisable);
            var totalKeys = disabledKeys.length;
            var keysThatAreModified = 0;
            disabledKeys.forEach(function(disableVarName) {
                var currentValue = String(current.vars[disableVarName]);
                var previousValue = String(previous.vars[disableVarName]);
                if (currentValue !== previousValue) {
                    current.vars[disableVarName] = previousValue;
                    keysThatAreModified += 1;
                }
            });

            if (keysThatAreModified) {
                gs.addErrorMessage(gs.getMessage('The data records cannot be saved due to access restrictions.'));
            }
        }
    }
})(current, previous);
