if (!pm.isZboot()) {
	var tables = new UnauthorizedChangeRequest().getExtensions();

	//Need to convert to a string from ArrayList
	var strArr = tables.toString();
	strArr = strArr.replace('[','');
	strArr = strArr.replace(']','');
	strArr = strArr.replace(' ','');

	var prop = new GlideRecord('unauth_chg_prop');
	if (prop.get('bdaaf92f231650101488dc1756bf6543')) {
		prop.setValue('include_ci_class', strArr);
		prop.update();
	}
}
