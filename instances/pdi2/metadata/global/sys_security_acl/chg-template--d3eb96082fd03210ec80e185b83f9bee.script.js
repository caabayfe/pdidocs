function checkAccess() {
    // Check if parent has run out on us
    var parentModelGr = null;
    try {
        parentModelGr = parent;
    } catch (e) {
        parentModelGr = null;
    }

    // Related list creation needs parent table to be model else return false
    if (parentModelGr && GlideDBObjectManager.get().getAllExtensions("chg_model").indexOf(parentModelGr.getTableName()) !== -1) {
        var sttrmModel = new STTRMModel(parentModelGr);
        return sttrmModel.canProposeTemplate();
    }

    return false;
}

answer = checkAccess();
