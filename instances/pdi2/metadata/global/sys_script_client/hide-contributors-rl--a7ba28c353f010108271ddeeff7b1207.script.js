function onLoad() {

    if (g_form.isNewRecord() === false) {
        if (g_user.hasRole("taxonomy_admin") === false) {
            if (g_user.hasRole("user_criteria_admin") === true) {
                isTaxonomyManager(g_form.getUniqueValue());
            } else {
                g_form.hideRelatedList('REL:a0677515533010108271ddeeff7b128d');
            }
        }
    }

    function isTaxonomyManager(taxonomyId) {
        var ga = new GlideAjax('TopicList');
        ga.addParam('sysparm_name', 'isTaxonomyManager');
        ga.addParam('sysparm_taxonomy_id', taxonomyId);
        ga.getXML(isManager);
    }

    function isManager(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer === "false") {
            g_form.hideRelatedList('REL:a0677515533010108271ddeeff7b128d');
        }
    }

}
