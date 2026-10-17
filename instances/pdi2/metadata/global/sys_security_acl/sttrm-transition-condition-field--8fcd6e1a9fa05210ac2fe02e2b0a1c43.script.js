function checkAccess() {
    // Check if parent has run out on us
    var localParent = null;
    try {
        localParent = parent;
    } catch (e) {
        localParent = null;
    }

    var parentTables = ["sttrm_transition_condition", "sttrm_condition_type"];

    // If it's not being created from a related list on sttrm_condition_type or sttrm_transition_condition return false
    if (localParent && !parentTables.includes(localParent.getTableName()))
        return false;

    //Check that we either have a local parent (new/edit from list) or a state (on insert of record)
    if (!localParent && (current.transition_condition.nil() || current.transition_condition.sttrm_state_transition.nil()))
        return false;

    // Populate the model to check, confirming correct structure
    var model = null;
    if (localParent &&
        !localParent.sttrm_state_transition.nil() &&
        !localParent.sttrm_state_transition.from_state.nil() &&
        !localParent.sttrm_state_transition.from_state.sttrm_model.nil()) {
        // walk up to model done from related list
        model = localParent.sttrm_state_transition.from_state.sttrm_model.getRefRecord();
    } else if (!current.transition_condition.nil() &&
        !current.transition_condition.sttrm_state_transition.nil() &&
        !current.transition_condition.sttrm_state_transition.from_state.nil() &&
        !current.transition_condition.sttrm_state_transition.from_state.sttrm_model.nil()) {
        model = current.transition_condition.sttrm_state_transition.from_state.sttrm_model.getRefRecord();
    }

    // If there's no model, no access
    if (!model)
        return false;

    return model.canWrite();
}

checkAccess();
