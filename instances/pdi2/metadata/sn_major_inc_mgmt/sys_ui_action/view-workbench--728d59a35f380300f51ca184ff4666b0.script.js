function openMIMWorkbench() {
    var cacheBuster = Date.now();
    var url = "/$major_incident_workbench.do?sysparm_stack=no&sysparm_sys_id=" + g_form.getUniqueValue() + "&sysparm_use_cache_buster=true&uxpcb=" + cacheBuster;


    var isPolarisEnabled = isPolaris();
    if (isPolarisEnabled) {
        var polarisPrefixUrl = "/now/nav/ui/classic/params/target/";
        var query = "/$major_incident_workbench.do?sysparm_stack=no&sysparm_full_theme_support=true&sysparm_use_polaris=true&sysparm_sys_id=" + g_form.getUniqueValue() + "&sysparm_use_cache_buster=true&uxpcb=" + cacheBuster;
        query = encodeURIComponent(query);
        url = polarisPrefixUrl + query;
    }

    var gsftFrame = parent.document.getElementById('gsft_main');
    //https://buildtools1.service-now.com/kb_view_customer.do?sysparm_article=KB0536462
    if (!gsftFrame)
        gsftFrame = parent.document.getElementById('testFrame');
    if (gsftFrame) {
        var gsftWindow = gsftFrame.contentWindow || gsftFrame.contentDocument;
        gsftWindow.location.href = url;
    } else {
        parent.location.href = url;
    }
}
