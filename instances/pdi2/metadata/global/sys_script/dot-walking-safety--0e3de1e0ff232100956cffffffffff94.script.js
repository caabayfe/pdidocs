var template = current.template;
var sameasIndex = template.indexOf("SAMEAS");
var dotIndex = template.indexOf("...");
while (dotIndex >= 0 && sameasIndex >= 0) {
	var subStr = template.substring(sameasIndex, dotIndex);
	if (subStr.indexOf("^") < 0) {
		current.template.setError("Invalid value for 'Set field values'");
		current.setAbortAction(true);
		break;
	}
	else {
		if (sameasIndex < dotIndex)
			sameasIndex = template.indexOf("SAMEAS", sameasIndex + 6);
		else
			dotIndex = template.indexOf("...", dotIndex + 3);
	}
}
