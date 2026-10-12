var sttrmModel = new STTRMModel(current.parent_template.sttrm_model.getRefRecord());
answer = sttrmModel.canWrite() || sttrmModel.canProposeTemplate();
