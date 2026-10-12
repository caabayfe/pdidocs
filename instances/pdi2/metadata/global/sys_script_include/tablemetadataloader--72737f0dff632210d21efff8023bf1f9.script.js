var TableMetadataLoader = Class.create();
TableMetadataLoader.prototype = Object.extendsObject(DMRuleConstants, {

    _scopeUtils: undefined,
    _archiveRuleManager: undefined,
    _cleanerRuleManager: undefined,
    _otdRuleManager: undefined,

    initialize: function() {
        this._scopeUtils = new DMCAppScopeUtils();
        this._archiveRuleManager = new ArchiveRuleManager();
        this._cleanerRuleManager = new TableCleanerRuleManager();
        this._otdRuleManager = new OnetimeDeleteRuleManager();
    },

    getMetadata: function(tableName, isEditFlow) {
		var metadata = {
			tableName: tableName,
			label: GlideTableDescriptor.get(tableName).getLabel(),
			scope: this._scopeUtils.getTableScope(tableName),
			dateTimeFields: this._getDateTimeFields(tableName),
			archive: {
				retainReferences: this._archiveRuleManager.hasRetainReferencesEnabled(tableName)
			},
			policy: this._getTableDMPolicy(tableName)
		};

		if (!isEditFlow) {
			var isTableUIEligible = this._isTableEligibleWithTableChoiceFiltering(tableName);
			metadata.ruleEligibility = {
				"archive": this._archiveRuleManager.isArchiveEligible(tableName) && isTableUIEligible,
				"table_cleaner": this._cleanerRuleManager.isCleanupEligible(tableName) && isTableUIEligible,
				"onetime_delete": this._otdRuleManager.isOneTimeDeleteEligible(tableName)
			};
		}
		
		return metadata;
	},

    /** Determines if a table is eligible based on GlideTableChoiceList filtering */
    _isTableEligibleWithTableChoiceFiltering: function(tableName) {
        var cl = new GlideTableChoiceList();
        cl.setAll(false);
        cl.setCanRead(true);
        cl.setShowTableNames(false);
        cl.setIncludeDefault(false);
        cl.generateChoices();

        var found = false;
        for (var i = 0; i < cl.size(); i++) {
            if (String(cl.getChoice(i).getValue()) === tableName) {
                found = true;
                break;
            }
        }

        if (!found) {
            return false;
        }
        return true;

    },

    _getDateTimeFields: function(tableName) {
        var dict = new GlideTableDescriptor(tableName);
        var fields = dict.getSchema();
        var itr = fields.values().iterator();
        var dateTimeFields = [];
        while (itr.hasNext()) {
            var field = itr.next();
            if (field.getInternalType() == "glide_date_time") {
                dateTimeFields.push({
                    label: field.getLabel(),
                    id: field.getName(),
                });
            }
        }
        return dateTimeFields;
    },
    _getTableDMPolicy: function(tableName) {
        const policy = {
            name: "",
            sysID: "",
            active: true
        };
        const gr = new GlideRecord(this.TABLES.SYS_DM_POLICY);
        gr.addQuery(this.FIELDS.TABLE_NAME, tableName);
        gr.query();
        if (gr.next()) {
            policy.name = gr.getValue(this.FIELDS.NAME);
            policy.sysID = gr.getUniqueValue();
            policy.active = gr.getValue(this.FIELDS.ACTIVE) == 1 ? true : false;
        }
        return policy;
    },

    type: 'TableMetadataLoader'
});
