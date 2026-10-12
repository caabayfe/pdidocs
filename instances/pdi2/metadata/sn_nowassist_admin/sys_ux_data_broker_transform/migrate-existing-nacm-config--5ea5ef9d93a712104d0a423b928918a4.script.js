function transform(inputs) {
	var result = {
		status: true,
		message: '',
		newConfigId: '',
		newConfigIds: []
    };
	if(!inputs.isMigrateConfigClicked){
		return result;
	} else if(inputs.isMigrateConfigClicked && (!inputs.newConfigName || !inputs.existingConfigId)){
		result.status = false;
		result.message = gs.getMessage('Config Name is a mandatory field');
	}
    
    try {
        var utils = new sn_wwna.NAAWWNAUtils();
		result = utils.migrateExistingConfig(inputs.existingConfigId, inputs.newConfigName);
		return result;
    } catch (error) {
		gs.error("Failed to Migrate Existing Config" + error.toString());
		result.status = false;
		result.message = error?.message || gs.getMessage('Failed To Migrate the Config!');
		return result;
    }
}
