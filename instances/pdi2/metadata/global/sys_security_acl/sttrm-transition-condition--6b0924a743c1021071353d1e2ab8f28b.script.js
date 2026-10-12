answer = false;

if (!gs.nil(current.sttrm_state_transition) && !gs.nil(current.sttrm_state_transition.from_state) && !gs.nil(current.sttrm_state_transition.from_state.sttrm_model))
    answer = current.sttrm_state_transition.from_state.sttrm_model.getRefRecord().canWrite();
