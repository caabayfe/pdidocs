function checkAccess() {
    // Check if parent has run out on us
    var localParent = null;
    try {
        localParent = parent;
    } catch (e) {
        localParent = null;
    }

    // If it's not being created from a related list on sttrm_condition_type return false
    if (localParent && new TableUtils(localParent.getTableName()).getTables().indexOf("sttrm_condition_type") === -1)
        return false;

    //Check that we either have a local parent (new/edit from list) or a state (on insert of record)
    if (!localParent && current.sttrm_condition_type.nil())
        return false;

    // Populate the sttrm_condition_type to check, confirming correct structure
    var conditionType = null;
    if (localParent)
        conditionType = localParent;

    else if (!current.sttrm_condition_type.nil())
        conditionType = current.sttrm_condition_type.getRefRecord();

    if (!conditionType)
        return false;

    return conditionType.canWrite();
}

checkAccess();
