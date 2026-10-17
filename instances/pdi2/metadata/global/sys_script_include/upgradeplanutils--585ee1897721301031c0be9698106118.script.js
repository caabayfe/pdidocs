var UpgradePlanUtils = Class.create();
UpgradePlanUtils.prototype = {
    initialize: function() {
    },
	
	getInstanceId: function() {
		var instanceId = GlideProperties.get('instance_id');
		if (JSUtil.nil(instanceId) || !gs.hasRole('upgrade_admin'))
			instanceId = '';
		return instanceId;
	},

    type: 'UpgradePlanUtils'
};
