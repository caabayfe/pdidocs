var ProductFieldCheck = Class.create();
ProductFieldCheck.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	isAnAssetForm: function(current, rp){
		if (new GlideRecord(current.getTableName()).canRead()) {
			currentView = rp.getParameterValue('sysparm_view');
			currentTarget = rp.getParameterValue('sysparm_target');
			var isReferenceList = (currentView == 'sys_ref_list');
			var isHardwareForm = (currentTarget == 'alm_hardware.model');
			var isConsumableForm = (currentTarget == 'alm_consumable.model');
			var isFacilityForm = (currentTarget == 'alm_facility.model');
			return isReferenceList && (isHardwareForm || isConsumableForm || isFacilityForm);
		}
	},

    type: 'ProductFieldCheck'
});
