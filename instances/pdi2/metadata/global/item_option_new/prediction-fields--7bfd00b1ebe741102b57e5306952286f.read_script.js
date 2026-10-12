var cpUtils = new global.CPIARUtils();
var listItems = cpUtils.getPredictionFieldList(current.getValue("target_table_name"));
var selectedItems = cpUtils.getPredictionFieldSelectedList(listItems, current.getValue("prediction_fields"));
answer = JSON.stringify({
    placeholderText: gs.getMessage("Enter field"),
    label:  gs.getMessage("Prediction fields"),
	listItems: listItems,
	selectedItems: selectedItems
});
