function transform(input){
	if(!input.skillConfigId || gs.hasRole('maint')){
		return {};
	}

	let utils = new sn_wwna.NAAWWNAUtils();
	return utils.fetchAdminConfigs(input.skillConfigId);
}
