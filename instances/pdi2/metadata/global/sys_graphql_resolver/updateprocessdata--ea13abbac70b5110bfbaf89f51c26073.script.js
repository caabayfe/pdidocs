(function process( /*ResolverEnvironment*/ env) {
    if (GlidePluginManager.isUpgradeSystemBusy()) {
        return PADConstants.UpgradeError;
    }

    var args = env.getArguments();

    var processId = args?.process?.sysId;

    if (!processId) {
        return PADConstants.RecordNotFoundError;
    }

    var processGr = new GlideRecord(PADConstants.TABLES.PD_PROCESS_DEFINITION);
    processGr.get(processId);

    var pdScopeSwitcher = new PDScopeSwitcher();
    try {
        pdScopeSwitcher.switchScope(processGr.getValue(PDConstants.FIELDS.SYS_SCOPE));
        if (!processGr.isValidRecord()) {
            return PADConstants.RecordNotFoundError;
        }

        // Check record level access
        // Content filters are applied to process read so check row level read and write before updating
        // Ideally we can just do canWrite, but canWrite doesnt include canRead (see DEF0776551)
        if (!processGr.canRead() || !processGr.canWrite()) {
            return PADConstants.UnauthorizedError;
        }

        // Check field level access
        // Since we only have one field with field level access, just hardcode it for now
        if (args?.process?.publicAccess && !processGr.getElement(PDConstants.FIELDS.PUBLIC_ACCESS).canWrite()) {
            return PADConstants.UnauthorizedError;
        }
    } finally {
        pdScopeSwitcher.resetScope();
    }

    var pdProcessService = new PDProcessService();

    try {
        var response = pdProcessService.updateProcess(env.getArguments());
        return response;
    } catch (err) {
        return {
            errorType: 'MUTATION_FAILED',
            message: err
        };
    }
})(env);
