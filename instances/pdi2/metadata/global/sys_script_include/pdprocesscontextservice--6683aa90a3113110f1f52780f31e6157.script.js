var PDProcessContextService = Class.create();
PDProcessContextService.prototype = {
    initialize: function(opts) {
		this.repository = (opts && opts.repository) || new PDProcessContextRepository();
    },
    archiveProcessContexts: function(contextIds) {
        return this.repository.archiveProcessContexts(contextIds);
    },
    deleteElementMappingsAndVariableValues: function(contextIds) {
        this.repository.deleteElementMappingsAndVariableValues(contextIds);
    },
    contextIsEligibleForArchive: function(contextRecord) {
        var dataRetentionEnabled = gs.getProperty('sn_pa_designer.enableDataRetentionFeatures');
        var state = contextRecord.getValue('state');
        var archive = contextRecord.getValue('archive');
        var parentActivityContext = contextRecord.getValue('parent_activity_context');

        if (dataRetentionEnabled === 'false') return false;
        else if (!['COMPLETE', 'SKIPPED', 'ERROR', 'CANCELLED'].includes(state)) return false;
        else if (archive) return false;
        else if (parentActivityContext) return false;

        return true;
    },
    type: 'PDProcessContextService'
};
