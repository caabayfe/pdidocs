function onLoad() {
    var ga = new GlideAjax('NowAssistForSearchStatus');
    ga.addParam('sysparm_name', 'isActive');
    ga.getXMLAnswer(function(answer) {
        if (answer === "false")
            g_form.hideRelatedList("ais_rule_mirror_m2m");
    });

}
