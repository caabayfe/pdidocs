function transform(input) {
	var td = GlideTableDescriptor.get(input.table);
    var element = (input.element || "").trim();
    if (gs.nil(element))
        element = td.getDisplayName();

	var ed = td.getElementDescriptor(element);
    var items = [];
    var selectedItems = [];
	
    var result = {
        "label": ed.getLabel(),
        "tooltip": ed.getHint(),
        "items": items,
        "selectedItems": selectedItems
    };

	var depVal = (input.dependentValue || "").trim();
	var ser = new GlideXMLChoiceListSerializer();
	var cl = ser.getChoiceList(ed.getTableName(), ed.getName(), depVal, null);
	for (var i = 0; i < cl.size(); i++) {
		var c = cl.getChoice(i);
		var label = c.getLabel();
		var id = c.getValue();
		items.push({
			"label": label,
			"id": id
		});
        if (selectedItems.length == 0)
			selectedItems.push(id);
	}
	
	return result;
}
