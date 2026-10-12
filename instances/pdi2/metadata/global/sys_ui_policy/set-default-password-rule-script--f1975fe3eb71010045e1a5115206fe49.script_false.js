function onCondition() {
	var script = "// This script is invoked during the password reset step and is used to\n";
	script += "// ensure that the new password is in compliance with password policy.\n";
	script += "// By default this script always returns true.\n\n";
	script += "function isPasswordValid(password) {\n";
	script += "    // TODO: add validation logic here\n";
	script += "    return true;\n";
	script += "}";
	g_form.setValue('pwd_rule', script);
}
