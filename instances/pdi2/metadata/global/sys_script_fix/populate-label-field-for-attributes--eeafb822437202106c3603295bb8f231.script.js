var defnAttributeGr = new GlideRecord("sys_one_extend_definition_attribute");
defnAttributeGr.addNullQuery("label");
defnAttributeGr.query();
while (defnAttributeGr.next()) {
	var name = defnAttributeGr.getValue("name");

	// Construct valid label based on name
	var label = name;
	if (name.indexOf("_") >= 0) {
		// Handle snake case
		label = name.replace(/(^\w)/g, function (match) {
			return match[0].toUpperCase();
		}).replace(/([-_]\w)/g, function (match) {
			return " " + match[1].toUpperCase();
		}).trim();
	} else {
		// Handle camel case
		label = name.replace(/([A-Z])/g, ' $1');
		label = label.charAt(0).toUpperCase() + label.slice(1);
		label = label.trim();
	}

	// Update label
	defnAttributeGr.label = label;
	defnAttributeGr.update();
}
