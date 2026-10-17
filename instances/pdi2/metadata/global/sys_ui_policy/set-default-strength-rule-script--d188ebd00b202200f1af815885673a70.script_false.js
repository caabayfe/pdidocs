function onCondition() {
	var script = "// This script is invoked during the password reset and password change steps.\n";
	script += "// It is used to calculate the strength of the new password.\n";
	script += "// The return value should be between 0 and 100, inclusive. \n";
	script += "// By default, this script returns 100.\n\n";
	script += "function calculatePasswordStrength(password) {\n";
	script += "    // TODO: add calculation logic here\n";
	script += "    var strength = 100;\n";
	script += "    return strength;\n";
	script += "}";
	g_form.setValue('strength_rule', script);
}
