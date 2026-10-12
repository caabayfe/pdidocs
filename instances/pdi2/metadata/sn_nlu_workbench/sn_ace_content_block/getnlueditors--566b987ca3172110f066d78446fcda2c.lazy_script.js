(function(context, pageParams, blockcontext) {
    var modelId = blockcontext.modelToAssignEditorsSysId;

    // All eligible editors
    var nluEditors = global.NLUSystemUtil.getNLUEditors();
    nluEditors.forEach(function(editor) {
        editor.label = editor.firstName + " " + editor.lastName;
        editor.sublabel = editor.email;
        editor.id = editor.sysId;
        delete editor.firstName;
        delete editor.lastName;
        delete editor.sysId;
        delete editor.email;
    });

    // Existing editors for selected model
    var assignedEditors = sn_nlu_workbench.NLUCoreUtils.getAssignedEditors(modelId);
    
    // Filtering the existing editors from all editors
    var selectedEditors = nluEditors.filter(function(editor) {
        return assignedEditors.indexOf(editor.id) !== -1;
    });

    return {
        selectedEditors: selectedEditors,
        nluEditors: nluEditors
    };
})(context, pageParams, blockcontext);
