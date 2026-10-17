function onLoad() {

    //Type appropriate comment here, and begin script below
    if (g_form.isNewRecord() && g_form.getValue('source') == "") {
        var url = new GlideURL();
        url.setFromCurrent();
        var tinyUrlId = url.getParam("sysparm_tiny");
        if (tinyUrlId) {
            var ajaxRequest = new GlideAjax('KBAjax');
            ajaxRequest.addParam('sysparm_type', 'getSourceForAttachedKnowledge');
            ajaxRequest.addParam('sysparm_id', tinyUrlId);
            ajaxRequest.addParam('sysparm_kbId', g_form.getUniqueValue());
            ajaxRequest.getXML(function(response) {
                if (response) {
                    var data = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
                    if(data != '-1')
                      g_form.setValue('source', data.sourceSysId);
                }
            });

        } else {
            var sourceTaskSysId = decodeURI(url.getParam('sysparm_collectionID'));
            var sourceTaskTable = decodeURI(url.getParam('sysparm_collection'));
            if (!sourceTaskTable || !sourceTaskSysId || sourceTaskTable == 'undefined' || sourceTaskSysId == 'undefined') {
                return;
            }

            var ajaxReq = new GlideAjax('KBAjax');
            ajaxReq.addParam('sysparm_type', 'canReadSourceTask');
            ajaxReq.addParam('sysparm_table', sourceTaskTable);
            ajaxReq.addParam('sysparm_id', sourceTaskSysId);
            ajaxReq.addParam('sysparm_kbSysId', g_form.getUniqueValue());
            ajaxReq.getXML(function(response) {
                if (response) {
                    var data = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
                    if(data == true)
                        g_form.setValue('source', sourceTaskSysId);
                }
            });
        }
    }
}
   
