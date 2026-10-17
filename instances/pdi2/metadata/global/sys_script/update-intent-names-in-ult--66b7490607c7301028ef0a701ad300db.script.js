(function executeRule(current, previous /*null when async*/ ) {

    var tables = NLUConstants.tables;
    var TABLE = global.MLLabeledData.TABLE;
    var FIELDS = global.MLLabeledData.FIELDS;
    var LABEL_PREFIX = global.MLLabeledData.LABEL_PREFIX;

    var modelName = current.model.name.getValue();
    var oldLabel = LABEL_PREFIX[tables.SYS_NLU_INTENT] + ':' + modelName + '.' + previous.name;
    var newLabel = LABEL_PREFIX[tables.SYS_NLU_INTENT] + ':' + modelName + '.' + current.name;

    var gr = new GlideRecord(TABLE);
    gr.addQuery(FIELDS.LABEL, oldLabel);
    gr.setValue(FIELDS.LABEL, newLabel);
    gr.updateMultiple();

    // Update correct_label
    gr = new GlideRecord(TABLE);
    gr.addQuery(FIELDS.CORRECT_LABEL, oldLabel);
    gr.setValue(FIELDS.CORRECT_LABEL, newLabel);
    gr.updateMultiple();

})(current, previous);
