function onLoad() {
    var ga = new GlideAjax("global.SPMClientUtilAjax");
    ga.addParam("sysparm_name", "hasChildNodes");
    ga.addParam("sysparm_sys_id", g_form.getUniqueValue()

    );
    ga.getXML(renderRelatedList);

    function renderRelatedList(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer && answer == 'leaf') {
            g_form.showRelatedList('cmdb_ci_service.spm_taxonomy_node');
        } else {
            g_form.hideRelatedList('cmdb_ci_service.spm_taxonomy_node');
        }
    }

}
