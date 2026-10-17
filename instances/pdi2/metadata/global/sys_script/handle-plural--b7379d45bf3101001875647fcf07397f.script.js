var lg = new GlideLabelGenerator();
var generatedPlural = lg.generatePlural(current.label);
if (!generatedPlural.nil())
	current.setValue("plural", generatedPlural);
