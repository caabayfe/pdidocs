var ReferenceTableRuleQualifier = Class.create();
ReferenceTableRuleQualifier.prototype = {
    initialize: function() {
    },
    buildReferenceQualifier: function(current) {
        var referenceName = String(current.getValue('reference'));
        if (!referenceName)
            return 'sys_idISEMPTY';

        var referenceTableName = String(referenceName).split('.')[0];

        var referenceTableHierarchy = GlideDBObjectManager.get().getTables(referenceTableName);
        var referenceTableHierarchyArray = new ArrayUtil().convertArray(referenceTableHierarchy);
        var referenceTableList = referenceTableHierarchyArray.join(',');

        var archiveRuleTableSysIdMultiMap = {};
        gr = new GlideRecord('sys_archive');
        gr.addQuery('table', 'IN', referenceTableList);
        gr.query();
        var ruleSysId;
        var ruleTable;
        var ruleName;

        while (gr.next()) {
            ruleTable = gr.getValue('table');
            ruleSysId = gr.getUniqueValue();
            ruleName = gr.getValue('name');

            if (!archiveRuleTableSysIdMultiMap.hasOwnProperty(ruleTable))
                archiveRuleTableSysIdMultiMap[ruleTable] = [];

            archiveRuleTableSysIdMultiMap[ruleTable].push(ruleSysId);
        }

        var choices = [];
        var tableName;
        for (var i = 0; i < referenceTableHierarchyArray.length; i++) {
            tableName = String(referenceTableHierarchyArray[i]);
            var tableNameSysIds = archiveRuleTableSysIdMultiMap[tableName];
            if (tableNameSysIds !== undefined)
                choices = choices.concat(tableNameSysIds);
        }

        if (!choices.length)
            return 'sys_idISEMPTY';

        return 'sys_idIN' + choices.join(',');
    },

    type: 'ReferenceTableRuleQualifier'
};
