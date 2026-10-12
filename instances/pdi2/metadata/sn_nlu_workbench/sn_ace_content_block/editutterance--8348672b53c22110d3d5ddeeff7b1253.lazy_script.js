(function(context, pageParams, blockcontext) {
    var editUtteranceObject = new sn_nlu_workbench.NLUExpertFeedbackUtil.editIrrelevantUtterance(blockcontext.editUtterance, blockcontext.editSysId);
    var rows = blockcontext.rowDefinition.rows;
    var editUttrAlert = blockcontext.editUttrAlert;
    if (editUtteranceObject.isDuplicate) {
        var label = editUtteranceObject.label;
        var labelType = editUtteranceObject.labelType;
        var editModelName = '';
        labelType === 'irrelevant_to_this_model' && blockcontext.models.map(function(model) {
            if (label.includes(model.id)) {
                editModelName = model.label;
            }
        });
        var content = labelType == 'irrelevant' ? gs.getMessage("This utterance has already been marked as not relevant to any model. Add a different one.") : gs.getMessage("This utterance has already been marked as not relevant to {0}. Choose another model.", editModelName);
        editUttrAlert = [{
            "status": "critical",
            "content": content
        }];
        return {
            rows: rows,
            editUttrAlert: editUttrAlert
        };
    }
    rows.map(function(ele, i) {
        if (ele.cells.sys_id.value === blockcontext.editSysId) {
            rows[i].cells.utterance.value = blockcontext.editUtterance;
            rows[i].cells.last_modified.value = editUtteranceObject.last_modified;
            var editedRow = rows.splice(i, 1);
            rows.unshift(editedRow[0]);
        }
    });
    return {
        rows: rows,
        editUttrAlert: []
    };
})(context, pageParams, blockcontext);
