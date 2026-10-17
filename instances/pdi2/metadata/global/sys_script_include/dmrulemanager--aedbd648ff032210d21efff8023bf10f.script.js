var DMRuleManager = Class.create();

DMRuleManager.prototype = Object.extendsObject(DMRuleConstants, {
    _archiveRuleManager: undefined,
    _cleanerRuleManager: undefined,
    _otdRuleManager: undefined,

    initialize: function() {
        this._archiveRuleManager = new ArchiveRuleManager();
        this._cleanerRuleManager = new TableCleanerRuleManager();
        this._otdRuleManager = new OnetimeDeleteRuleManager();
    },

    createOrUpdateRule: function(rule) {
        const {
            rule_type
        } = rule;

        if (JSUtil.notNil(rule_type)) {
            if (rule_type == this.RULE_TYPES.TABLE_CLEANER) {
                return this._cleanerRuleManager.createOrUpdateRule(rule[this.RULE_TYPES.TABLE_CLEANER]);
            } else if (rule_type == this.RULE_TYPES.ARCHIVE) {
                return this._archiveRuleManager.createOrUpdateRule(rule[this.RULE_TYPES.ARCHIVE]);
            } else if (rule_type == this.RULE_TYPES.ONETIME_DELETE) {
                return this._otdRuleManager.createOrUpdateRule(rule[this.RULE_TYPES.ONETIME_DELETE]);
            }
        }
    },

    getRule: function(ruleType, sysID) {
        if (JSUtil.notNil(ruleType)) {
            if (ruleType == this.RULE_TYPES.TABLE_CLEANER) {
                return this._cleanerRuleManager.getRule(sysID);
            } else if (ruleType.toLowerCase() == this.RULE_TYPES.ARCHIVE) {
                return this._archiveRuleManager.getRule(sysID);
            } else if (ruleType == this.RULE_TYPES.ONETIME_DELETE) {
                const rule = this._otdRuleManager.getRule(sysID);
                rule.rollback_excluded_list = this._otdRuleManager.getRollbackExcludedTables(sysID, rule.table);
                return rule;
            }
        }
    },

    activateRule: function(ruleType, sysID, isActive) {
        if (JSUtil.notNil(ruleType)) {
            if (ruleType.toLowerCase() == this.RULE_TYPES.TABLE_CLEANER) {
                return this._cleanerRuleManager.activateRule(sysID, isActive);
            } else if (ruleType.toLowerCase() == this.RULE_TYPES.ARCHIVE) {
                return this._archiveRuleManager.activateRule(sysID, isActive);
            }
        }
    },

    deleteRule: function(ruleType, sysID) {
        if (JSUtil.notNil(ruleType)) {
            if (ruleType == this.RULE_TYPES.TABLE_CLEANER) {
                return this._cleanerRuleManager.deleteRule(sysID);
            } else if (ruleType.toLowerCase() == this.RULE_TYPES.ARCHIVE) {
                return this._archiveRuleManager.deleteRule(sysID);
            } else if (ruleType == this.RULE_TYPES.ONETIME_DELETE) {
                return this._otdRuleManager.deleteRule(sysID);
            }
        }
    },

    type: 'DMRuleManager'
});
