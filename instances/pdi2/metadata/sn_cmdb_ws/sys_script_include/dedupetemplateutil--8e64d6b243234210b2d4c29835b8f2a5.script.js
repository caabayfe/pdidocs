var DedupeTemplateUtil = Class.create();
DedupeTemplateUtil.prototype = {
    RECONCILE_TEMPLATE_TABLE: "reconcile_duplicate_template",

    DEDUPLICATION_TEMPLATE_ERROR_SOURCE: 'sn_cmdb_ws_deduplication_template',

    ACTIONS: {
        ADD_TEMPLATE_CONDITIONS: 'ADD_TEMPLATE_CONDITIONS',
        ADD_TEMPLATE_SCRIPT: 'ADD_TEMPLATE_SCRIPT'
    },

    ERROR_CODES: {
        DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE: 'DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE'
    },

    ROLES: {
        CMDB_DEDUP_ADMIN: 'cmdb_dedup_admin'
    },

    initialize: function() {
		this.MERGE_RELATED_ITEMS_ENHANCED_PROPERTY = 'glide.duplicate_ci_remediator.merge_related_items_enhanced';
	},

    addTemplateConditions: function(templateId, conditions) {
	if (!this._hasPermission()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE,
                action: this.ACTIONS.ADD_TEMPLATE_CONDITIONS,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user must have cmdb_dedup_admin role to add conditions to template"),
                details: "Required role: cmdb_dedup_admin to add conditions to template"
            });
        }

        var result = {
            error: "",
            display_error: ""
        };

        // Cannot use GlideRecordSecure as maint is allowed to create/update templates
        var gr = new GlideRecord(this.RECONCILE_TEMPLATE_TABLE);
        if (gr.get(templateId)) {
            gr.setValue('conditions', conditions);
            if (!gr.update()) {
                gs.error("Failed to add template conditions for template " + templateId);
                result.error = "Failed to add template conditions";
                result.display_error = gs.getMessage("Failed to add template conditions, please try again");
            }
        } else {
            result.display_error = gs.getMessage("Input template is invalid");
            result.error = "Input template sys_id " + templateId + " is invalid";
        }
        return result;
    },

    getTemplateConditions: function(templateId) {
        var conditions = '';
        templateId = this._trim(templateId);

        if (gs.nil(templateId)) {
            gs.debug("Empty template sys_id");
            return conditions;
        }
        var gr = new GlideRecordSecure(this.RECONCILE_TEMPLATE_TABLE);
        if (gr.get(templateId)) {
            conditions = gr.getValue('conditions');
        } else {
            gs.debug("Invalid template sys_id");
        }
        return conditions;
    },

    addTemplateScript: function(templateId, advanced, script) {
	if (!this._hasPermission()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE,
                action: this.ACTIONS.ADD_TEMPLATE_SCRIPT,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user must have cmdb_dedup_admin role to add script to template"),
                details: "Required role: cmdb_dedup_admin to add script to template"
            });
        }

        var result = {
            error: "",
            display_error: ""
        };

        // Cannot use GlideRecordSecure as maint is allowed to create/update templates
        var gr = new GlideRecord(this.RECONCILE_TEMPLATE_TABLE);
        if (gr.get(templateId)) {
            gr.setValue('script', script);
            gr.setValue('advanced', advanced);
            if (!gr.update()) {
                gs.error("Failed to add template script for template " + templateId);
                result.error = "Failed to add template script";
                result.display_error = gs.getMessage("Failed to add template script, please try again");
            }
        } else {
            result.display_error = gs.getMessage("Input template is invalid");
            result.error = "Input template sys_id " + templateId + " is invalid";
        }
        return result;
    },

    getTemplateScript: function(templateId) {
        var result = {
            script: '',
            advanced: false
        };

        templateId = this._trim(templateId);

        if (gs.nil(templateId)) {
            gs.debug("Empty template sys_id");
            return result;
        }
        var gr = new GlideRecordSecure(this.RECONCILE_TEMPLATE_TABLE);
        if (gr.get(templateId)) {
            result.script = gr.getValue('script');
			result.advanced = gr.getValue('advanced');
        } else {
            gs.debug("Invalid template sys_id");
        }
        return result;
    },

	mergeRelatedItemsEnhancedPropertyEnabled : function() {
        var propertyVal = gs.getProperty(this.MERGE_RELATED_ITEMS_ENHANCED_PROPERTY, true);
        return propertyVal === 'true';
    },

    _trim: function(pValue) {
        if (pValue) {
            return pValue.trim();
        }
        return pValue;
    },

    getTranslatedLabels: function() {
        return {
            UNABLE_TO_SAVE_PREVIEW_TEMPLATE: sn_i18n.Message.getMessage("sn_cmdb_ws", "Unable to save and preview template. A network or server error occurred"),
            UNABLE_TO_CREATE_TEMPLATE: sn_i18n.Message.getMessage("sn_cmdb_ws","Unable to create template. A network or server error occurred"),
            UNABLE_TO_UDPATE_TEMPLATE: sn_i18n.Message.getMessage("sn_cmdb_ws","Unable to update template. A network or server error occurred"),
            UNABLE_TO_CREATE_LIBRARY: sn_i18n.Message.getMessage("sn_cmdb_ws","Unable to create library. A network or server error occurred"),
            UNKNOWN_ERROR: sn_i18n.Message.getMessage("sn_cmdb_ws","Unknown error occurred."),
			MERGE_RELATED_ITEMS_INFO_MESSAGE: sn_i18n.Message.getMessage("sn_cmdb_ws", "For some related tables, updating the duplicate CI references with main CI reference during the remediation process might be blocked by business rules or database errors. Use the following table to configure the system to skip all business rules and/or ignore errors for those related tables. For more information, see "),
			MANAGE_RELATED_TABLES_CONFIGURATION: sn_i18n.Message.getMessage("sn_cmdb_ws", "Manage Related Tables Configuration"),
			MERGE_RELATED_ITEMS_CURRENT_SETTING_MESSAGE: sn_i18n.Message.getMessage("sn_cmdb_ws", "Current settings for affected selected tables"),
			SKIP_BUSINESS_RULES: sn_i18n.Message.getMessage("sn_cmdb_ws", "Skip Business Rules"),
			IGNORE_ERRORS: sn_i18n.Message.getMessage("sn_cmdb_ws", "Ignore Errors"),
			TRUE: sn_i18n.Message.getMessage("", "true"),
			FALSE: sn_i18n.Message.getMessage("", "false")
        };
    },

    _hasPermission: function() {
        return gs.getUser().hasRole(this.ROLES.CMDB_DEDUP_ADMIN);
    },
    type: 'DedupeTemplateUtil'
};
