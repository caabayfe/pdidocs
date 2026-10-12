function checkAccess() {
    var parentTemplateGr = current.sttrm_base_template.getRefRecord();

    // Related list creation needs parent table to be model else return false
    if (parentTemplateGr && GlideDBObjectManager.get().getAllExtensions("sttrm_base_template").indexOf(parentTemplateGr.getTableName()) !== -1) {
        var sttrmModel = new STTRMBaseTemplate(parentTemplateGr).getModel();
        return sttrmModel && (sttrmModel.canWrite() || sttrmModel.canProposeTemplate());
    }

    return false;
}

answer = new STTRMBaseTemplate(current.sttrm_base_template.getRefRecord()).canDelete() && checkAccess();
