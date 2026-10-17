var CatalogMobileUpgradeUtil = Class.create();
CatalogMobileUpgradeUtil.prototype = {
    initialize: function() {
        gcd = GlideCollisionDetector.get();
    },

    //****************************************** <CommonUtils> *******************************************

    TABLE: {
        SYS_SG_ITEM_VIEW: "sys_sg_item_view",
        SYS_SG_UI_STYLE: "sys_sg_ui_style",
        SYS_SG_FORM_SCREEN: "sys_sg_form_screen",
        SYS_SG_MASTER_ITEM: "sys_sg_master_item",
        SYS_SG_BUTTON_INSTANCE: "sys_sg_button_instance",
        SYS_SG_UI_PARAMETER: "sys_sg_ui_parameter",
        SYS_SG_ITEM_PARAMETER: "sys_sg_item_parameter",
        SYS_SG_ACTION_PARAM_MAP: "sys_sg_action_param_map"
    },
    FIELD: {
        ACTIVE: "active",
        PARAMETER_TYPE: "parameter_type",
        BUTTON: "button",
        PARENT_TABLE: "parent_table",
        PARENT: "parent",
        UI_STYLES: "ui_styles",
        SYS_UPDATE_NAME: "sys_update_name"
    },

    isRecordCustomized: function(gr) {
        if (gr != null && !gr.isValidRecord())
            return false;

        return gcd.containsKey(gr.getValue(this.FIELD.SYS_UPDATE_NAME));
    },

    getGlideRecord: function(tableName, sysId) {
        var gr = new GlideRecord(tableName);
        gr.setWorkflow(false);
        gr.get(sysId);
        return gr;
    },

    //****************************************** </CommonUtils> *******************************************



    //********************************* <upgrade_handling_for_item_views> *********************************

    cleanItemViewUpgrade: function(itemViewMap) {
        for (var itemViewId in itemViewMap) {
            var itemViewGr = new GlideRecord(this.TABLE.SYS_SG_ITEM_VIEW);
            itemViewGr.get(itemViewId);

            if (!itemViewGr || !itemViewGr.isValidRecord()) {
                gs.warn("CatalogMobileUpgradeUtil: cleanItemViewUpgrade: Skipping revert as sys_sg_item_view Record {0} not found", itemViewId);
            } else if (gs.nil(itemViewMap[itemViewId][this.TABLE.SYS_SG_MASTER_ITEM]) && gs.nil(itemViewMap[itemViewId][this.TABLE.SYS_SG_FORM_SCREEN])) {
                gs.warn("CatalogMobileUpgradeUtil: cleanItemViewUpgrade: Skipping revert as no master or form screen mapped for sys_sg_item_view Record {0}", itemViewId);
            } else if (this.isItemViewFlowCustomized(itemViewGr)) {
                this.revertUntouchedItems(itemViewGr, itemViewMap, this.TABLE.SYS_SG_MASTER_ITEM);
                this.revertUntouchedItems(itemViewGr, itemViewMap, this.TABLE.SYS_SG_FORM_SCREEN);
            } else {
                gs.info("CatalogMobileUpgradeUtil: cleanItemViewUpgrade: Skipping revert as sys_sg_item_view Record {0} not customized", itemViewId);
            }
        }
    },

    isItemViewFlowCustomized: function(itemViewGr) {
        return this.isRecordCustomized(itemViewGr) || this.isUIStyleCustomized(itemViewGr);
    },

    isUIStyleCustomized: function(itemViewGr) {
        var uiStyles = itemViewGr.getValue(this.FIELD.UI_STYLES);
        var gr = new GlideRecord(this.TABLE.SYS_SG_UI_STYLE);
        gr.setWorkflow(false);
        gr.addQuery("sys_id", "IN", uiStyles);
        gr.query();
        while (gr.next()) {
            if (this.isRecordCustomized(gr))
                return true;
        }
        return false;
    },

    revertUntouchedItems: function(itemViewGr, itemViewMap, tableName) {
        if (gs.nil(itemViewMap[itemViewGr.getUniqueValue()][tableName]))
            return;

        var gr = new GlideRecord(tableName);
        gr.setWorkflow(false);
        gr.addQuery("sys_id", "IN", itemViewMap[itemViewGr.getUniqueValue()][tableName]);
        gr.query();
        if (gr.hasNext()) {
            while (gr.next()) {
                if (!this.isRecordCustomized(gr) && gr.getValue("use_view_config") && gs.nil(gr.getValue("item_view"))) {
                    gs.info("CatalogMobileUpgradeUtil: revertUntouchedItems: Reverting {0} Record {1} ", tableName, itemViewMap[itemViewGr.getUniqueValue()][tableName]);
                    gr.setValue("use_view_config", 0);
                    gr.setValue("item_view", itemViewGr.getUniqueValue());
                    gr.setWorkflow(true);
                    if (gr.update())
                        gs.info("CatalogMobileUpgradeUtil: revertUntouchedItems: Reverted {0} Record {1} ", tableName, gr.getUniqueValue());
                    else
                        gs.info("CatalogMobileUpgradeUtil: revertUntouchedItems: Update of parent record failed.");
                }
            }
        } else {
            gs.warn("CatalogMobileUpgradeUtil: revertUntouchedItems: No valid {0} record found for revert, hence no action taken ", tableName);
        }
    },

    //********************************* </upgrade_handling_for_item_views> *************************************



    //********************************* <upgrade_handling_for_button_instance> *********************************

    cleanButtonInstanceUpgrade: function(instanceMap) {
        for (var oldInstance in instanceMap) {
            if (gs.nil(instanceMap[oldInstance].new_instance)) {
                gs.warn("CatalogMobileUpgradeUtil: cleanButtonInstanceUpgrade: Skipping upgrade for {0} as no new sys_sg_button_instance mapped", oldInstance);
            } else {
                var oldInstanceGr = this.getGlideRecord(this.TABLE.SYS_SG_BUTTON_INSTANCE, oldInstance);
                var newInstanceGr = this.getGlideRecord(this.TABLE.SYS_SG_BUTTON_INSTANCE, instanceMap[oldInstance].new_instance);
                if (!newInstanceGr || !newInstanceGr.isValidRecord()) {
                    gs.warn("CatalogMobileUpgradeUtil: cleanButtonInstanceUpgrade: Skipping upgrade as new sys_sg_button_instance Record {0} not found", instanceMap[oldInstance].new_instance);
                } else if (!oldInstanceGr || !oldInstanceGr.isValidRecord()) {
                    gs.warn("CatalogMobileUpgradeUtil: cleanButtonInstanceUpgrade: Skipping upgrade as sys_sg_button_instance Record {0} not found", oldInstance);
                } else if (this.isButtonInstanceFlowCustom(oldInstanceGr)) {
                    this.deActivateRecord(newInstanceGr);
                } else {
                    this.deActivateRecord(oldInstanceGr);
                }
            }
        }
    },

    isButtonInstanceFlowCustom: function(buttonInstanceGr) {
        if (!this.isRecordCustomized(buttonInstanceGr)) {
            var buttonGr = buttonInstanceGr.button.getRefRecord();
            if (!buttonGr || !buttonGr.isValidRecord()) {
                gs.error("CatalogMobileUpgradeUtil: isButtonInstanceFlowCustom: Skipping upgrade because sys_sg_button Record for instance {0} not found", buttonInstanceGr.getUniqueValue());
                return true;
            }
            if (!this.isRecordCustomized(buttonGr)) {
                var actionItemGr = buttonGr.write_back_action_item.getRefRecord();
                if (!actionItemGr || !actionItemGr.isValidRecord()) {
                    gs.error("CatalogMobileUpgradeUtil: isButtonInstanceFlowCustom: Skipping upgrade because sys_sg_action_item Record for instance {0} not found", buttonInstanceGr.getUniqueValue());
                    return true;
                }
                if (!this.isRecordCustomized(actionItemGr)) {
                    return this.hasCustomizedUIParam(buttonGr) || this.hasCustomizedItemParam(actionItemGr) || this.hasCustomizedActionParamMap(buttonGr);
                }
            }
        }
        return true;
    },

    hasCustomizedUIParam: function(buttonGr) {
        var gr = new GlideRecord(this.TABLE.SYS_SG_UI_PARAMETER);
        gr.setWorkflow(false);
        gr.addQuery(this.FIELD.PARAMETER_TYPE, "button");
        gr.addQuery(this.FIELD.BUTTON, buttonGr.getUniqueValue());
        gr.query();
        while (gr.next()) {
            if (this.isRecordCustomized(gr))
                return true;
        }
        return false;
    },

    hasCustomizedItemParam: function(actionItemGr) {
        var gr = new GlideRecord(this.TABLE.SYS_SG_ITEM_PARAMETER);
        gr.setWorkflow(false);
        gr.addQuery(this.FIELD.PARENT_TABLE, actionItemGr.getTableName());
        gr.addQuery(this.FIELD.PARENT, actionItemGr.getUniqueValue());
        gr.query();
        while (gr.next()) {
            if (this.isRecordCustomized(gr))
                return true;
        }
        return false;
    },
    hasCustomizedActionParamMap: function(buttonGr) {
        var gr = new GlideRecord(this.TABLE.SYS_SG_ACTION_PARAM_MAP);
        gr.setWorkflow(false);
        gr.addQuery(this.FIELD.BUTTON, buttonGr.getUniqueValue());
        gr.query();
        while (gr.next()) {
            if (this.isRecordCustomized(gr))
                return true;
        }
        return false;
    },

    deActivateRecord: function(gr) {
        if (gr && gr.isValidRecord() && gr.getValue(this.FIELD.ACTIVE) == 1 && !this.isRecordCustomized(gr)) {
            gr.setWorkflow(true);
            gr.setValue(this.FIELD.ACTIVE, 0);
            if (!gr.update())
                gs.info("CatalogMobileUpgradeUtil: deActivateRecord: failed to deactivate sys_sg_button_instance Record {0}", gr.getUniqueValue());
            else
                gs.info("CatalogMobileUpgradeUtil: deActivateRecord: sys_sg_button_instance Record {0} deactivated", gr.getUniqueValue());
        } else {
            gs.error("CatalogMobileUpgradeUtil: deActivateRecord: Skipped deactivation because sys_sg_button_instance Record {0} not found or already deactivated", gr.getUniqueValue());
        }
    },

    //********************************* </upgrade_handling_for_button_instance> *********************************

    type: 'CatalogMobileUpgradeUtil'
};
