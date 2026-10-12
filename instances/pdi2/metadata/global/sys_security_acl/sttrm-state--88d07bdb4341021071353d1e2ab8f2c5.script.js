answer = false;

if (!gs.nil(current.sttrm_model))
    answer = current.sttrm_model.getRefRecord().canWrite();
