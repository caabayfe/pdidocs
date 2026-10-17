function redirectToProcessConfigBuilder() {
    var url = "now/experience/promin/process-configuration";
    var isContentPack = false;
    try {
        // navigating from process configuration -form page
        url = "now/experience/promin/process-configuration-details/" + g_form.getUniqueValue() + "/process-details";
    } catch (error) {
        // navigating from configurations -list page
        if (typeof g_list !== 'undefined') {
            isContentPack = g_list.filter.includes('content_pack=true');
            if (isContentPack) {
                url = "now/experience/promin/process-configuration/params/selected-tab-index/2";
            }
        }
    }
    g_navigation.open(url, "_blank");
}
