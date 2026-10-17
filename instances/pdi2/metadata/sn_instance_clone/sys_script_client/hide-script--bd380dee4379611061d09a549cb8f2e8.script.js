function onLoad() {
    if (g_form.getViewName() == "clone_ui") {
		//making script mandatory while opening new form
		g_form.setMandatory('script', false);
		g_form.setDisplay('script', false);
    }
}
