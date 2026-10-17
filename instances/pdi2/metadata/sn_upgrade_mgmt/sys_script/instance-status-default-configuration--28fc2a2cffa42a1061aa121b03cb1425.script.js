(function executeRule(current, previous /*null when async*/ ) {
    // Check if is_prod is true for the current instance being processed
    if (!current.is_prod) {
        return;
    }

    var instanceId = current.instance_id;
    var selfInstanceId = gs.getProperty('instance_id');

    // Check if the current instance (selfInstanceId) is also a production instance
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

    // Create a new entry in sn_mif_instance_trusted_by_me
    sn_mif.MIFPublicAPI.addInstanceTrustedByMe(instanceId, capabilitySysId);
    gs.info('Created an entry in sn_mif_instance_trusted_by_me with capability: ' + capabilitySysId + ' and instance: ' + instanceId);
})(current, previous);
