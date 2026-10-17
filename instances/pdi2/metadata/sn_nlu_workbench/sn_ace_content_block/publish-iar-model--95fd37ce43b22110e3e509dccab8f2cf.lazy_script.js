(function(context, pageParams, blockcontext) {
    (new sn_nlu_workbench.NLUIARTuning(blockcontext.iarTuneAnalysisId)).publishModel(blockcontext.selectedTuneBias);
    return {
        disablePublish: false
    };
})(context, pageParams, blockcontext);
