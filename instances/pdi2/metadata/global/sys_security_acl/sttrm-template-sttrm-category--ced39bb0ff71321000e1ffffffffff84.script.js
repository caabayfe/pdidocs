function checkAccess() {
    var parentTemplateGr = current.sttrm_template.getRefRecord();
    if (parentTemplateGr && GlideDBObjectManager.get().getAllExtensions("sttrm_base_template").indexOf(parentTemplateGr.getTableName()) !== -1) {
        var sttrmModel = new STTRMModel(parentTemplateGr.sttrm_model.getRefRecord());
        return sttrmModel.canWrite() || sttrmModel.canProposeTemplate();
    }

    return false;
}

answer = checkAccess();
