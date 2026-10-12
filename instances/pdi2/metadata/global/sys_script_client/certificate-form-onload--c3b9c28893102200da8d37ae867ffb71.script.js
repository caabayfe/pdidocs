function onLoad() {
	if (g_form.isNewRecord()) {
	    var element = gel("add_me_locked.sys_certificate.notify_on_expiration");
	    var ref = element.getAttribute("data-ref");
	    var u = element.getAttribute("data-user-id");
	    var name = element.getAttribute("data-user").replace(/\\'/, "'");;
	    addGlideListChoice('select_0' + ref, u, name);	
		lock($(ref + "_lock"), ref, ref + "_edit", ref + "_nonedit", "select_0" + ref, ref + "_nonedit");
	}
}
