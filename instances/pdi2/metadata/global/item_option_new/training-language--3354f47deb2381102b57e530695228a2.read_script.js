var cpUtils = new global.CPIARUtils();
var listItems = new global.AutoResolutionLanguageChoiceListBuilder().getSupportedLanguagesForUIB();
var selectedItems = cpUtils.getPredictionFieldSelectedList(listItems, current.getValue("training_language"));
answer = JSON.stringify({
    placeholderText: gs.getMessage("Select language"),
    label:  gs.getMessage("Training language"),
	listItems: listItems,
	selectedItems: selectedItems,
	required: true
});
