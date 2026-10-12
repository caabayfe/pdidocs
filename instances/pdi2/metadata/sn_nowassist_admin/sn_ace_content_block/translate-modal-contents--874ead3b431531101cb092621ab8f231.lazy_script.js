(function(context, pageParams, blockcontext) {
    // return some_output
    var titleLable = blockcontext.modalTitle;
    var translatedTitle = gs.getMessage("{0} is now active for {1}", [titleLable, blockcontext.product]);
    var modalSubtitle = !gs.nil(blockcontext.modalSubtitle) && blockcontext.modalSubtitle !== "null" ? blockcontext.modalSubtitle : '';
    var modalButtonLabel = gs.getMessage("Return to {0}", blockcontext.product);
    
    if(pageParams.featureId == 'f98eb0e9775131101b53c5ed3c5a99aa'){
        translatedTitle = gs.getMessage("{0} is now active!",titleLable);
        modalButtonLabel = gs.getMessage("Back to skills");
    }
    return {
        modalTitle: translatedTitle,
        modalSubtitle: modalSubtitle,
        modalButtonLabel: modalButtonLabel
    };
})(context, pageParams, blockcontext);
