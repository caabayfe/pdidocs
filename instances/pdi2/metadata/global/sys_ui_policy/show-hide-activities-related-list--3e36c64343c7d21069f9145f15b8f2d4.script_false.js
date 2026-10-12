function onCondition() {
    g_form.hideRelatedList('sys_pd_process_type_activity_definition_map.process_type');

    var annotation = document.getElementById('select_activities_annotation');
    var parent = annotation.parentElement;
    annotation.style.visibility = 'hidden';
    annotation.style.height = '0';
    parent.style.visibility = 'hidden';
    parent.style.height = '0px';
    parent.style.padding = '0px';
    parent.style.margin = '0px';
}
