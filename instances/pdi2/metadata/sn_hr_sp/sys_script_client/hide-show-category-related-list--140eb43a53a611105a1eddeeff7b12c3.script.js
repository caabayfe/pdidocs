function onLoad() {
    var ga = new GlideAjax('TodosFilterClientUtil');
    ga.addParam('sysparm_name', 'isChildFilter');
    ga.addParam('sysparm_filter', g_form.getUniqueValue());
    ga.getXML(isChildTable);

}

function isChildTable(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    if (answer == 'true')
        g_form.hideRelatedList('sn_hr_sp_todo_filter_m2m_category.filter');
}
