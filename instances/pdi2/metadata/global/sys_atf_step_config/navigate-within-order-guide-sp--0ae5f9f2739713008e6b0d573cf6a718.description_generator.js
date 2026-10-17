function generateDescription() {
    // the global variable 'step' represents the current glide record
    var description = "Navigate to ";
	switch('' + step.inputs.guide_step) {
		case "1":
			description += "'Describe Needs'";
			break;
		case "2":
			description += "'Choose Options'";
			break;
		case "3":
			description += "'Summary'";
			break;
	}
	description += " step.";
	return description;
}
 generateDescription();
