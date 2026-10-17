var template = current.template;
var dotIndex = template.indexOf("...");
var toIndex = template.indexOf("=", dotIndex + 3);
while (dotIndex >= 0 && toIndex >= 0) {
	var subStr = template.substring(dotIndex, toIndex);
	if (subStr.indexOf("^") < 0) {
		current.template.setError("Invalid value for 'Set field values'");
		current.setAbortAction(true);
		break;
	}
	else {
		dotIndex = template.indexOf("...", dotIndex + 3);
		toIndex = template.indexOf("=", dotIndex + 3);
	}
}
