(function(context, pageParams, blockcontext) {
    var modelId = blockcontext.modelToAssignEditorsSysId;
    var authorsList = blockcontext.selectedEditors.reduce(function(authors, editor) {
        return authors.concat(editor.id);
    }, []).join() || '';
    return sn_nlu_workbench.NLUCoreUtils.updateEditorsForModel(modelId, authorsList);
})(context, pageParams, blockcontext);
