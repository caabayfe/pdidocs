function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    var script = g_form.getValue("script");
	//isDefaultTemplate is loaded globally in an onLoad client script
    var mine = isDefaultTemplate(script);

    if (newValue == "global") {
        if (mine) {
            g_form.setValue("script", "");
		}

    } else {
		//trigger our When onchange to populate the script
        var whenWas = g_form.getValue("when");
        
		if (whenWas == "before")
			g_form.setValue("when", "after");
		else
			g_form.setValue("when", "before");
		
		//put it back to the original value
        g_form.setValue("when", whenWas);
	}
}
