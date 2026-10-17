function onSubmit() {
	var dmn = g_form.getValue("domain");
	var last = dmn.charAt(dmn.length-1);
	var first = dmn.charAt(0);
	if(first == ' ' || last == ' ') {
		g_form.showFieldMsg("domain", getMessage("Remove leading/trailing spaces"), "error");
		return false;
	}
}
