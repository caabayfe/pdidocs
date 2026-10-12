(function() {
	var sectionLabel = (current.label + "").trim();
	current.name = "Section " + current.index + (!JSUtil.nil(sectionLabel) ? " (" + sectionLabel + ")" : "")
})()
