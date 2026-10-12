function onLoad() {
    var url = new GlideURL(window.location.href);
    var urlParams = url.getParams();
   //check if its called from context menu, then add the info message about creation of Export Definition.
    if (url.getParam('sysparm_easy_export')) {
        g_form.addInfoMessage(
        	formatMessage(
        		getMessage('Export Definition ed_t_{0} created based on list of {1}s . Select an Export Target and click Submit to save the export set.'),
        		url.getParam('sysparm_table'),
        		url.getParam('sysparm_table')))
    }
   
}
