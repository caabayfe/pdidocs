function updateExtendedValidElements() {
    var propertyName = "glide.ui.html.editor.extended_valid_elements";
    var newElement = "now-illustration-custom[token-id|src|alt|width|height]";

    var currentValue = gs.getProperty(propertyName, "");

	if (!currentValue.includes(newElement)) {
		var updatedValue = currentValue ? currentValue + "," + newElement : newElement;
		gs.setProperty(propertyName, updatedValue);
		gs.log("ADS: System property updated successfully: " + propertyName);
    } else {
		gs.log("ADS: System property " + propertyName + " already has the value " + newElement);
	}
}

updateExtendedValidElements();
