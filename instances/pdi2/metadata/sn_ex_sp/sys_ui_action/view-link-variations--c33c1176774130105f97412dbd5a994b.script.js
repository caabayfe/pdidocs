function redirect () {
	var isActive = g_form.getValue("active");
	if(isActive == "false") {
        g_form.addErrorMessage("The quick link you are previewing is not active. Please change it to active and preview again.");
	}
	else{
        var url = "esc/?id=quick_link_preview&quick_link_id="+g_form.getUniqueValue();
        g_navigation.open(url,"_blank");
	}
}
