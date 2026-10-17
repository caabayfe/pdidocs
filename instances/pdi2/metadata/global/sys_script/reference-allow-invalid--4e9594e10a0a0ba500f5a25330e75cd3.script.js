if (!current.hasAttributes("allow_invalid")) {
    current.attributes = (!current.attributes.nil()? current.attributes + "," : "") + "allow_invalid=true";
	current.setWorkflow(false);
    current.update();
	current.setWorkflow(true);
}
