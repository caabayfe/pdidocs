var variable = current.catalog_variable.getDisplayValue().split("IO:")[1];
if (!variable)
	variable = current.catalog_variable.split("IO:")[1];
var option = new GlideRecord("item_option_new");
if (option.get(variable)) {
	if (option.name.nil())
		current.variable = option.question_text;
	else 
		current.variable = option.name;
} else {
	option = new GlideRecord("item_option_new_set");
	if (option.get(variable)) {
		current.variable = option.internal_name;
	}
}
