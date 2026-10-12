var DestroyRuleReferenceUtil = Class.create();
DestroyRuleReferenceUtil.prototype = {
    initialize: function() {},

    getArchiveRules: function(arTable, currentDestroyRuleId) {
        var rules = [];

        if (!arTable || !arTable.startsWith('ar_'))
            return 'sys_idIN' + rules;

        var table = arTable.substring(3);

        var archiveRuleGr = new GlideRecord('sys_archive');
        archiveRuleGr.addQuery('table', table);
        archiveRuleGr.addQuery('sys_id', 'NOT IN', this._getAssociatedArchiveRuleIds(arTable, currentDestroyRuleId));
        archiveRuleGr.query();

        while (archiveRuleGr.next()) {
            rules.push(archiveRuleGr.getUniqueValue());
        }

        return 'sys_idIN' + rules;
    },

    _getAssociatedArchiveRuleIds: function(tableName, currentDestroyRuleId) {
        var destroyRuleGr = new GlideRecord('sys_archive_destroy');
        destroyRuleGr.addQuery('table', tableName);
        destroyRuleGr.addNotNullQuery('archive');
        if (currentDestroyRuleId)
            destroyRuleGr.addQuery('sys_id', 'NOT IN', currentDestroyRuleId);

        destroyRuleGr.query();
        var archiveRuleIds = [];
        while (destroyRuleGr.next()) {
            archiveRuleIds.push(destroyRuleGr.getValue('archive'));
        }

        return archiveRuleIds;
    },

    type: 'DestroyRuleReferenceUtil'
};
