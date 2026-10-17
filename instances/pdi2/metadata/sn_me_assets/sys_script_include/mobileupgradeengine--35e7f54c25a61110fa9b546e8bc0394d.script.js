var MobileUpgradeEngine = Class.create();
MobileUpgradeEngine.prototype = {
    initialize: function() {
    },
	
	upgradeForLegacyCardsDeprecate: function() {
		var FORM_SCREEN_TABLE = 'sys_sg_form_screen';
		var LIST_SCREEN_TABLE = 'sys_sg_master_item';
		var SCREEN_TABLE_MAP = {
			legacyCardSysId: 'sys_sg_item_view_',
			uiStyles: 'sys_sg_ui_style_'
		};
		// List of all the cards
		var	formScreenArray =
		[{
			legacyCardSysId:'a1e5e74887d83300693331a2f5cb0b17',
			screenSysId:'25262b4887d83300693331a2f5cb0bdf',
			cardSysId:'541e524c77511110814d99f69c5a99e8',
			uiStyles: ['4251101605d21010fa9b8e9c93c0383b', '1a01d41605d21010fa9b8e9c93c038ad']
		}];
		var	listScreenArray =
		[{
			legacyCardSysId:'89302b8487d83300693331a2f5cb0b57',
			screenSysId:'6bd06f8487d83300693331a2f5cb0b11',
			cardSysId:'541e524c77511110814d99f69c5a99e8',
			uiStyles: ['47ee44d205d21010fa9b8e9c93c0384d', 'e07f04d205d21010fa9b8e9c93c0389e']
		}];
		formScreenArray.forEach(function(card) {
			// Check if legacy card or associated UI style is customised
			if (MobileUpgradeEngine.isCustomised(SCREEN_TABLE_MAP.legacyCardSysId+card.legacyCardSysId) || MobileUpgradeEngine.isAnyCustomised(SCREEN_TABLE_MAP.uiStyles+card.uiStyles)) {
				// Update screen to legacyCard and use_view_config = false
				new global.GlideQuery(FORM_SCREEN_TABLE)
					.where('sys_id', card.screenSysId)
					.updateMultiple({item_view: card.legacyCardSysId, use_view_config: false});
			}
		});
		listScreenArray.forEach(function(card) {
			// Check if legacy card or associated UI style is customised
			if (MobileUpgradeEngine.isCustomised(SCREEN_TABLE_MAP.legacyCardSysId+card.legacyCardSysId) || MobileUpgradeEngine.isAnyCustomised(SCREEN_TABLE_MAP.uiStyles , card.uiStyles)) {
				// Update screen to legacyCard and use_view_config = false
				new global.GlideQuery(LIST_SCREEN_TABLE)
					.where('sys_id', card.screenSysId)
					.updateMultiple({item_view: card.legacyCardSysId, use_view_config: false});
			}
		});
	},
	upgradeForButtonInstanceDeprecate: function() {
		var FUNCTION_INSTANCE_TABLE  = 'sys_sg_button_instance';
		var FUNCTION_INSTANCE_TABLE_MAP = {
			functionInstance:'sys_sg_button_instance_',
			functionSysId:'sys_sg_button_',
			actionItemSysId:'sys_sg_write_back_action_item_',
			UIParameterSysId:'sys_sg_ui_parameter_',
			itemParameter:'sys_sg_item_parameter_',
			actionParmMap:'sys_sg_action_param_map_'
			groupedInput: 'sys_sg_grouped_input_',
		};
		// List of all the button (function) instance
		var	functionDetailsArray =
			[{
				functionInstanceSysId: ['814fef0c87d83300693331a2f5cb0b08'],
				functionSysId: '6b8e6b0c87d83300693331a2f5cb0b33',
				actionItemSysId:'6bbda30c87d83300693331a2f5cb0bc2',
				UIParameterSysId: ['00eeeb0c87d83300693331a2f5cb0b7f', '33beab0c87d83300693331a2f5cb0ba3', '5c1f6f0c87d83300693331a2f5cb0b5c', '940f2f0c87d83300693331a2f5cb0b81', 'ccba58a787103300693331a2f5cb0b15'],
				groupedIpSysId: '',
				itemParameter: ['1a3e670c87d83300693331a2f5cb0ba1', '955ea70c87d83300693331a2f5cb0b8f', '3c48146787103300693331a2f5cb0bdf', '2c6ee70c87d83300693331a2f5cb0b2b', '0f6ee70c87d83300693331a2f5cb0bce'],
				actionParmMap: ['198f234c87d83300693331a2f5cb0b9c', '37ca98a787103300693331a2f5cb0b24', '3d9f634c87d83300693331a2f5cb0b3b', '54af634c87d83300693331a2f5cb0bc0', 'e67f234c87d83300693331a2f5cb0b57'],
				newFunInstanceSysId: ['255dc91875121110fa9bab175e99c958']
			}];
		functionDetailsArray.forEach(function(funInstance) {
			// Check if any of the files related to function instance is customised
			if (MobileUpgradeEngine.isCustomised(FUNCTION_INTANCE_TABLE_MAP.functionSysId+funInstance.functionSysId) || MobileUpgradeEngine.isCustomised(FUNCTION_INTANCE_TABLE_MAP.actionItemSysId+funInstance.actionItemSysId) || MobileUpgradeEngine.isAnyCustomised(FUNCTION_INTANCE_TABLE_MAP.UIParameterSysId, funInstance.UIParameterSysId) || MobileUpgradeEngine.isCustomised(FUNCTION_INTANCE_TABLE_MAP.groupedInput + funInstance.groupedIpSysId) || MobileUpgradeEngine.isAnyCustomised(FUNCTION_INTANCE_TABLE_MAP.itemParameter, funInstance.itemParameter) || MobileUpgradeEngine.isAnyCustomised(FUNCTION_INTANCE_TABLE_MAP.actionParmMap, funInstance.actionParmMap))  {
				// mark the new function instance inactive
				new global.GlideQuery(FUNCTION_INSTANCE_TABLE)
					.where('sys_id', 'IN', funInstance.newFunInstanceSysId)
					.updateMultiple({active: false});
			} else {
				// check if function instance is customised, if yes, mark corresponding new function instance inactive
				var funInstanceArray = funInstance.functionInstanceSysId;
				for (var i=0; i< funInstanceArray.length; i++) {
					if (MobileUpgradeEngine.isCustomised(FUNCTION_INSTANCE_TABLE_MAP.functionInstance + funInstanceArray[i])) {
						new global.GlideQuery(FUNCTION_INSTANCE_TABLE)
							.where('sys_id', funInstance.newFunInstanceSysId[i])
							.updateMultiple({active: false});
					} else {
						new global.GlideQuery(FUNCTION_INSTANCE_TABLE)
							.where('sys_id', funInstanceArray[i])
							.updateMultiple({active: false});
					}
				}
			}
		});
	},
	type: 'MobileUpgradeEngine'
};
//if any customisation happens in isCustomised similar changes needed in isAnyCustomised
MobileUpgradeEngine.isCustomised = function(fileName) {
	if (fileName) {
		return new global.GlideQuery('sys_update_xml')
			.where('name',fileName)
			.where('sys_created_by', '!=', 'system')
			.selectOne()
			.isPresent();
	}
	return false;
};
// return true if any of the sysIds is customised
MobileUpgradeEngine.isAnyCustomised = function(prefix,sysIdArray) {
	var sysIdArrayWithPrefix = [];
	sysIdArray.forEach(function(sysId) {
		sysIdArrayWithPrefix.push(prefix+sysId);
	});
	return new global.GlideQuery('sys_update_xml')
		.where('name','IN',sysIdArrayWithPrefix)
		.where('sys_created_by', '!=', 'system')
		.selectOne()
		.isPresent();
};
