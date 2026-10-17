var sttrmModel = new STTRMModel(current.sttrm_model.getRefRecord());
answer = sttrmModel.canWrite() || sttrmModel.canProposeTemplate();
