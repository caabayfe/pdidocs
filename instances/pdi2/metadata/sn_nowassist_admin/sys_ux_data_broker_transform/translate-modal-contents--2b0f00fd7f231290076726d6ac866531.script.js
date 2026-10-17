function transform(input) {
    try {
		var titleLable = input.modalTitle;
		var translatedTitle = gs.getMessage("{0} is now active for {1}", [titleLable, input.product]);
		var modalSubtitle = !gs.nil(input.modalSubtitle) && input.modalSubtitle !== "null" ? input.modalSubtitle : '';
		var modalButtonLabel = gs.getMessage("Back to skills");
		
		if(!gs.nil(input.feature) && input.feature == 'f98eb0e9775131101b53c5ed3c5a99aa'){
			translatedTitle = gs.getMessage("{0} is now active!",titleLable);
			modalButtonLabel = gs.getMessage("Back to skills");
		}
		return {
			modalTitle: translatedTitle,
			modalSubtitle: modalSubtitle,
			modalButtonLabel: modalButtonLabel
		};

    } catch (e) {
        gs.error("Failed to fetch translated modal contents - " + e);
        throw new Error("Failed fetch translated modal contents");
    }
}
