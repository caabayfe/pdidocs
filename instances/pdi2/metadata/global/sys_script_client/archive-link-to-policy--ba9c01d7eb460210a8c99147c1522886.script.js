function onLoad() {
	window.hidePolicyMessage = function() {
        setPreference("hide.policy.archive.annotation", true, g_form.clearMessages);
    };

	var hideMessage = getPreference("hide.policy.archive.annotation");
        if (hideMessage == "true" || hideMessage == true)
            return;


    var link = '<a href="sys_dm_policy_list.do">Data Management Policy</a>';
	var dismissMessage = "Click <a href='#' onclick='hidePolicyMessage();'>here</a> if you don't want to see this message again.";

    var gwt = new GwtMessage();
    g_form.addInfoMessage(gwt.getMessage("Try new {0} experience here. &#160;&#160; {1}", link, dismissMessage));
}
