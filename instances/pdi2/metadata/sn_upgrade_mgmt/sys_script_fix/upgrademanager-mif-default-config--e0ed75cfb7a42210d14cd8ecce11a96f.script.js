(function executeFixScript() {
    gs.info('Executing Fix Script: Upgrade Manager default MIF setup');

    var selfInstanceId = gs.getProperty('instance_id');

    var selfInstanceGR = new GlideRecord('sn_mif_instance');
    selfInstanceGR.addQuery('instance_id', selfInstanceId);
    selfInstanceGR.addQuery('is_prod', true);
    selfInstanceGR.query();

    if (selfInstanceGR.next()) {
        gs.info('Skipping entry because the current instance itself is a production instance: ' + selfInstanceId);
        return;
    }

    // Fetch the sys_id of "Upgrade Manager" capability
    var capabilityGR = new GlideRecord('sn_mif_capability');
    capabilityGR.addQuery('name', 'Upgrade Manager');
    capabilityGR.query();
	if (!capabilityGR.next()) {
        gs.info('Capability "Upgrade Manager" not found in sn_mif_capability table.');
        return;
    }

    var capabilitySysId = capabilityGR.getValue('sys_id');
	
	// Process production instances
	var prodInstanceGR = new GlideRecord('sn_mif_instance');
    prodInstanceGR.addQuery('is_prod', true);
    prodInstanceGR.query();

    while (prodInstanceGR.next()) {
        var instanceId = prodInstanceGR.getValue('instance_id');
		// Create a new entry in sn_mif_instance_trusted_by_me
		sn_mif.MIFPublicAPI.addInstanceTrustedByMe(instanceId, capabilitySysId);
		gs.info('Created entry for capability: ' + capabilitySysId + ' and instance: ' + instanceId);
    }

})();
