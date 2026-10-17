(function executeRule(current, previous /*null when async*/ ) {

    var modelFields = ['name', 'language', 'state', 'confidence_threshold', 'category', 'vocabulary_needs_review'];
    if (NLUSystemUtil.isRecordChanged(modelFields, current, previous)) {
        (new NLUModel(current.sys_id)).setDirty();
    }

})(current, previous);
