function checkAccess() {
    var model = null;
    if (!current.transition_condition.nil() &&
        !current.transition_condition.sttrm_state_transition.nil() &&
        !current.transition_condition.sttrm_state_transition.from_state.nil() &&
        !current.transition_condition.sttrm_state_transition.from_state.sttrm_model.nil()) {
        model = current.transition_condition.sttrm_state_transition.from_state.sttrm_model.getRefRecord();
    }

    // If there's no model, no access
    if (!model)
        return false;

    return model.canRead();
}

checkAccess();
