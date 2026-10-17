(function process( /*ResolverEnvironment*/ env) {

    var pdScopeSwitcher = new PDScopeSwitcher();
    try {
        // Ensure user has write access to this process definition. This covers multiple checks in one including write access, delegated development access, and playbook type restrictions
        const processDefinitionId = env.getArguments().processDefinitionId;
        if (!processDefinitionId) {
            throw PADConstants.Errors.Messages.INVALID_ARGUMENT;
        }
        const processGr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
		if(!processGr.get(processDefinitionId)) {
			throw PADConstants.Errors.Messages.UNAUTHORIZED;
		}
        const processScope = processGr.getValue(PDConstants.FIELDS.SYS_SCOPE);
        pdScopeSwitcher.switchScope(processScope);
        if (!processGr.canWrite()) {
            throw PADConstants.Errors.Messages.UNAUTHORIZED;
        }

        // Ensure associated table is provided
        const associatedTable = env.getArguments().queryConditions.split('=')[1];
        if (!associatedTable) {
            throw PADConstants.Errors.Messages.INVALID_ARGUMENT;
        }

        // Ensure table exists and user has read access
        const tableGr = new GlideRecord(associatedTable);
        if (!GlideSecurityManager.get().hasRightsTo(`record/${associatedTable}/read`, null)) {
            throw PADConstants.Errors.Messages.UNAUTHORIZED;
        }

        const result = PDUtils.getFormViewsForTable(associatedTable);
        return result;

    } catch (err) {
        return [{
            errorType: 'QUERY_FAILED',
            message: err.message
        }];
    } finally {
        pdScopeSwitcher.resetScope();
    }
})(env);
