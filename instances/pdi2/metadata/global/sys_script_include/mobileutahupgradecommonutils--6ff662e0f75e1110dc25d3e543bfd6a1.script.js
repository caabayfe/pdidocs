var MobileUtahUpgradeCommonUtils = Class.create();
MobileUtahUpgradeCommonUtils.prototype = {
	TABLE: {
		SYS_SG_ITEM_VIEW: "sys_sg_item_view",
		SYS_SG_UI_STYLE: "sys_sg_ui_style",
		SYS_SG_FORM_SCREEN: "sys_sg_form_screen",
		SYS_SG_MASTER_ITEM: "sys_sg_master_item"
	},
	initialize: function () {
		this.GCD = GlideCollisionDetector.get();
	},
	isRecordCustomized: function (record) {
		if (!gs.nil(this.GCD))
			return this.GCD.containsKey(record.getValue("sys_update_name"));
		else {
			var updates = new GlideRecord("sys_update_xml");
			return updates.get("name", record.getValue("sys_update_name"));
		}
	},
	getGlideRecord: function (tableName, sysId) {
		var record = new GlideRecord(tableName);
		record.get(sysId);
		return record;
	},
	getMultipleGlideRecords: function (tableName, sysIds) {
		var records = new GlideRecord(tableName);
		records.addQuery("sys_id", "IN", sysIds);
		records.query();
		return records;
	},
	revertCardtoItemView: function (masterGr, itemViewSysId) {
		masterGr.setValue("use_view_config", 0);
		masterGr.setValue("item_view", itemViewSysId);
		masterGr.setWorkflow(false);
		masterGr.update();
		gs.info("MobileCardViewMigrationTools: revertUntouchedItems: Reverted {0} Record {1} ", masterGr.getTableName(), masterGr.getUniqueValue());
	},
	
	revertButton: function(btnInstanceGr, oldBtnSysId){
		btnInstanceGr.setValue("button",oldBtnSysId);
		btnInstanceGr.setWorkflow(false);
		btnInstanceGr.update();
		gs.info("MobileCardViewMigrationTools: revertButton: Reverted SYS_SG_BUTTON_INSTANCE Record {0} ", btnInstanceGr.getUniqueValue());
	},

	cleanUpgradeLegacyCards: function (itemViewMap) {
		for (var itemView in itemViewMap) {
			var itemViewGr = this.getGlideRecord(this.TABLE.SYS_SG_ITEM_VIEW, itemView);
			if (!itemViewGr || !itemViewGr.isValidRecord()) {
				gs.warn("MobileCardViewMigrationTools: cleanUpgrade: Skipping revert as sys_sg_item_view Record {0} not found", itemView);
			} else if (gs.nil(itemViewMap[itemView][this.TABLE.SYS_SG_MASTER_ITEM]) && gs.nil(itemViewMap[itemView][this.TABLE.SYS_SG_FORM_SCREEN])) {
				gs.warn("MobileCardViewMigrationTools: cleanUpgrade: Skipping revert as no master or form screen mapped for sys_sg_item_view Record {0}", itemView);
			} else if (this.isItemViewFlowCustom(itemViewGr)) {
				this.revertUntouchedItems(itemViewGr, itemViewMap[itemView], this.TABLE.SYS_SG_MASTER_ITEM);
				this.revertUntouchedItems(itemViewGr, itemViewMap[itemView], this.TABLE.SYS_SG_FORM_SCREEN);
			} else {
				gs.info("MobileCardViewMigrationTools: cleanUpgrade: Skipping revert as sys_sg_item_view Record {0} not customized", itemView);
			}
		}
	},
	isItemViewFlowCustom: function (itemViewGr) {
		return this.isRecordCustomized(itemViewGr) || this.isUIStyleCustomized(itemViewGr);
	},
	isUIStyleCustomized: function (itemViewGr) {
		var uiStyles = itemViewGr.getValue("ui_styles");
		var uiStylesGr = this.getMultipleGlideRecords(this.TABLE.SYS_SG_UI_STYLE, uiStyles);
		while (uiStylesGr.next()) {
			if (this.isRecordCustomized(uiStylesGr))
				return true;
		}
		return false;
	},
	revertUntouchedItems: function (itemViewGr, itemViewMap, tableName) {
		if (gs.nil(itemViewMap[tableName]))
			return;
		var masterGr = this.getMultipleGlideRecords(tableName, itemViewMap[tableName]);
		masterGr.query();
		if (masterGr.hasNext()) {
			while (masterGr.next()) {
				if (!this.isRecordCustomized(masterGr) && masterGr.getValue("use_view_config") && gs.nil(masterGr.getValue("item_view")))
					this.revertCardtoItemView(masterGr, itemViewGr.getUniqueValue());
			}
		} else {
			gs.warn("MobileCardViewMigrationTools: revertUntouchedItems: No valid {0} record found for revert, hence no action taken ", tableName);
		}
	},

	type: 'MobileUtahUpgradeCommonUtils'
};
