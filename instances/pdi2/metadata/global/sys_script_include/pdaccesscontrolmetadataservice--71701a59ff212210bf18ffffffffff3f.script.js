var PDAccessControlMetadataService = Class.create();
PDAccessControlMetadataService.prototype = {
    initialize: function() {},
    type: 'PDAccessControlMetadataService',

    updateAccessControlMetadata: function(processResult, triggers) {
        var accessControlMetadata = {
            processDefinition: {
                canWrite: false,
            },
            triggerTables: []
        };
        
        var pdScopeSwitcher = new PDScopeSwitcher();
        try {
            pdScopeSwitcher.switchScope((processResult.sys_scope || {}).value);
            var processGr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
            processGr.get(processResult.sys_id.value);
            if (processGr.isValidRecord()) accessControlMetadata.processDefinition.canWrite = processGr.canWrite();
        } finally {
            pdScopeSwitcher.resetScope();
        }

        if (PDUtils.notEmptyArray(triggers)) {
            var validTables = {};
            for (var i = 0; i < triggers.length; i++) {
                var tableVar = triggers[i].inputs.variables.find(function(variable) {
                    return variable.variableName === PDConstants.FIELDS.TABLE;
                }) || {};

                var tableName = tableVar.variableValue;
                if (!tableName) {
                    continue;
                }
                if (!GlideTableDescriptor.isValid(tableName)) {
                    // Server validation behavior will handle non-existent table
                    continue;
                }
                
                if (validTables[tableName] === undefined) {
                    validTables[tableName] = GlideSecurityManager.get().hasRightsTo(`record/${tableName}/read`, null)
                }
            }

            Object.keys(validTables).forEach(function(key) {
                accessControlMetadata.triggerTables.push({
                    tableName: key,
                    canRead: validTables[key]
                });
            });
        }

        processResult.accessControlMetadata = accessControlMetadata;
    }
};
