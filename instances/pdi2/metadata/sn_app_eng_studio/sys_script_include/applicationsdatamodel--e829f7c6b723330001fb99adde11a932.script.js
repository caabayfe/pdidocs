var ApplicationsDataModel = (function() {

    return {
        generate: function(
            applicationSysId /*object of key/value pairs representing an app*/ ,
            appLastOpenedDatesByUser /*object of key/value pairs of appSysId and date last opened by user in AES*/
        ) {
            var applicationRecord = new GlideRecord("sys_scope");

            if (!applicationRecord.get(applicationSysId))
                return;

            appLastOpenedDatesByUser = appLastOpenedDatesByUser || new ApplicationService().getUserAppsLastOpened();
            var lastOpenedByUserInAES = appLastOpenedDatesByUser && appLastOpenedDatesByUser[applicationSysId];
            var lastOpenedByUserInAESDispVal = lastOpenedByUserInAES &&
                new GlideDateTime(lastOpenedByUserInAES).getDisplayValue(); //uses current user session time zone
            var templates = new GlideRecord('sys_app_template');
            templates.addQuery('create_app', 'true');
            templates.addQuery('sys_scope', applicationRecord.getUniqueValue());
            templates.query();
            var sysAppInfoUtils = new SysAppInfoUtils(applicationRecord.getUniqueValue());
            var isSourceApp = sysAppInfoUtils.getIsSourceApp();
            var templateId = null;

            if (isSourceApp) {
                var templateGR = new GlideRecord('sys_app_template');
                var hasTemplate = templateGR.get('source_id', applicationRecord.getUniqueValue());
                templateId = hasTemplate && templateGR.getUniqueValue();
            }

            var appData = {
                "sys_id": applicationSysId,
                "source_app": templates.hasNext() || isSourceApp,
                "template_id": templateId,
                "class_name": applicationRecord.getValue("sys_class_name"),
                "name": ValueDisplayValueModel(applicationRecord, "name"),
                "description": ValueDisplayValueModel(applicationRecord, "short_description"),
                "version": applicationRecord.getValue("version") || "",
                "scope_name": applicationRecord.getValue("scope") || "",
                "created": ValueDisplayValueModel(applicationRecord, "sys_created_on"),
                "created_by": ValueDisplayValueModel(applicationRecord, "sys_created_by"),
                "updated_by": ValueDisplayValueModel(applicationRecord, "sys_updated_by"),
                "type": {
                    "value": "Application",
                    "display_value": gs.getMessage("Application")
                },
                "icon": applicationRecord.getValue("icon") || "configuration-item-outline",
                "illustration": this._getIllustration(applicationRecord.getDisplayValue("logo")),

                "last_opened_in_aes": {
                    value: lastOpenedByUserInAES,
                    display_value: lastOpenedByUserInAESDispVal
                },

                "isPublishable": this._getAppPublishable(applicationSysId, applicationRecord),
                isGeneratedFromAI: sysAppInfoUtils.getIsGeneratedFromAI(),
            };

            return appData;
        },

        _getIllustration: function(logoAttachmentFile) {
            // logo url stored in Appliction record
            if (!gs.nil(logoAttachmentFile))
                return "/" + logoAttachmentFile;

            return "";
        },

        _getAppPublishable: function(applicationSysId, applicationRecord) {
            var isPublishable = false;
            var className = applicationRecord.getRecordClassName();

            var gr = new GlideRecord(className);
            var record = gr.get('sys_id', applicationSysId);

            if (record && className == 'sys_app') {
                isPublishable = true;
            }

            if (record && className == 'sys_store_app') {
                isPublishable = sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableById(applicationSysId);
            }

            return isPublishable;
        },
    };
})();
