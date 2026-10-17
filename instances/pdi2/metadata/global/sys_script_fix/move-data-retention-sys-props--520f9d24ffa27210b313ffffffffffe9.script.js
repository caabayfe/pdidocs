// Map of <old sys_id> : <new sys_id>
var sysPropMap = {
    'e156d7e0a3100210385a2780f31e61f8': '94ced524ffa27210b313ffffffffff14', // data_retention_policy
    '42bc7237a3300210385a2780f31e61f2': 'c862e5a8ffa27210b313ffffffffff7c' // enableDataRetentionFeatures
};

var keys = Object.keys(sysPropMap);   // array of the old sys_ids
for (var i = 0; i < keys.length; i++) {
	var oldId = keys[i];
    if (!sysPropMap.hasOwnProperty(oldId)) continue;

    var newId = sysPropMap[oldId];
    var oldExists = false;
    var oldValue, oldName;

    //---------------------------------------------------
    // 1. Fetch OLD property (if present)
    //---------------------------------------------------
    var oldGR = new GlideRecord('sys_properties');
    if (oldGR.get(oldId)) {
        oldExists = true;
        oldValue = oldGR.getValue('value');
        oldName = oldGR.getValue('name');

        // Mark old as deprecated so the name is free
        oldGR.setValue('name', oldName + '.DEPRECATED');
        oldGR.update();
    } else {
        gs.warn('PAD#MoveDataRetentionSysProps: Old sys_property ' + oldId + ' not found.');
    }

    //---------------------------------------------------
    // 2. Fetch NEW property
    //---------------------------------------------------
    var newGR = new GlideRecord('sys_properties');
    if (!newGR.get(newId)) {
        gs.warn('PAD#MoveDataRetentionSysProps: New sys_property ' + newId + ' not found – skipping.');
        continue; // nothing further we can do for this pair
    }

    var newNameCurrent = newGR.getValue('name'); // e.g., "data_retention_policy_new"

    //---------------------------------------------------
    // 3. Update name for NEW property
    //---------------------------------------------------
    var targetName = newNameCurrent.replace(/_new$/, ''); // remove suffix if it’s there

    //---------------------------------------------------
    // 4. Copy value (only when old exists and differs)
    //---------------------------------------------------
    if (oldExists) {
        var newValue = newGR.getValue('value');
        if (newValue !== oldValue) {
            newGR.setValue('value', oldValue);
            gs.info('PAD#MoveDataRetentionSysProps: Value copied from old (' + oldId + ') to new (' + newId + ').');
        }
    }

    //---------------------------------------------------
    // 5. Rename NEW property
    //---------------------------------------------------
    newGR.setValue('name', targetName);

    //---------------------------------------------------
    // 6. Update new record
    //---------------------------------------------------
    newGR.update();

    //---------------------------------------------------
    // 7. Delete old record (if it existed)
    //---------------------------------------------------
    if (oldExists) {
        oldGR.deleteRecord();
        gs.info('PAD#MoveDataRetentionSysProps: Deleted old sys_property ' + oldId);
    }
}
