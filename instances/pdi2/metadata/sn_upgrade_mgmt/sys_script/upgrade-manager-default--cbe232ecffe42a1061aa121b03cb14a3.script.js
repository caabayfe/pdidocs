(function executeRule(current, previous /*null when async*/ ) {
    // Ensure that the added capability is "Upgrade Manager"
    if (current.name != "Upgrade Manager") {
        return;
    }

    var capabilitySysId = current.getValue('sys_id');

    // Get the current instance ID and check if it is a production instance
    var currentInstanceId = gs.getProperty('instance_id'); // Fetch current instance ID
    var currentInstanceGR = new GlideRecord('sn_mif_instance');
    currentInstanceGR.addQuery('instance_id', currentInstanceId);
    currentInstanceGR.addQuery('is_prod', true);
    currentInstanceGR.query();
    if (currentInstanceGR.next()) {
        gs.info('Current instance is production, skipping entry creation.');
        return;
    }

    // Query all production instances (is_prod = true)
    var instanceGR = new GlideRecord('sn_mif_instance');
    instanceGR.addQuery('is_prod', true);
    instanceGR.query();

    while (instanceGR.next()) {
        var instanceId = instanceGR.getValue('instance_id');

        // Create a new entry in sn_mif_instance_trusted_by_me
        sn_mif.MIFPublicAPI.addInstanceTrustedByMe(instanceId, capabilitySysId);
        gs.info('Created entry in sn_mif_instance_trusted_by_me with capability: ' + capabilitySysId + ' and instance: ' + instanceId);
    }
})(current, previous);
