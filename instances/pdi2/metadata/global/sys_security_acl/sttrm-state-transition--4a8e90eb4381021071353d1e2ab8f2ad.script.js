answer = false;

if (!gs.nil(current.from_state) && !gs.nil(current.from_state.sttrm_model))
    answer = current.from_state.sttrm_model.getRefRecord().canRead();
