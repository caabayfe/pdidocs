var CMPGetRelatedResourcesForLDC = Class.create();
CMPGetRelatedResourcesForLDC.prototype = {
	initialize: function() {
	},

	//method used by some of the vcenter resources which has both contained and hosted on relationship with LDC
	getResources: function(current,parent){
		if (!GlidePluginManager.isActive('com.snc.cloud.mgmt') && parent.sys_class_name == 'cmdb_ci_vcenter_datacenter') {
			this.getContainedResources(current,parent);
		} else {
			this.getHostedResources(current,parent);
		}
	},

	getHostedResources: function(current,parent) {
		var record = current.addJoinQuery('cmdb_rel_ci', 'sys_id', 'parent');
		record.addCondition('child', parent.getUniqueValue());
		record.addCondition('type', "5f985e0ec0a8010e00a9714f2a172815"); //Hosted on::Hosts
		return record;
	},
	
	getContainedResources: function(current,parent) {
		var record = current.addJoinQuery('cmdb_rel_ci', 'sys_id', 'child');
		record.addCondition('parent', parent.getUniqueValue());
		record.addCondition('type', "55c95bf6c0a8010e0118ec7056ebc54d"); //Contains::Contained by
		return record;
	},
	
	type: 'CMPGetRelatedResourcesForLDC'
};
