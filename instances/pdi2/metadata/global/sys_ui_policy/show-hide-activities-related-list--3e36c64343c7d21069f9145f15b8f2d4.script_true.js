function onCondition() {
    g_form.showRelatedList('sys_pd_process_type_activity_definition_map.process_type');

    var annotation = document.getElementById('select_activities_annotation');
    var parent = annotation.parentElement;
    if (!g_scratchpad.containsActivities) {
        annotation.style.visibility = 'visible';
        annotation.style.height = 'auto';
        parent.style.visibility = 'visible';
        parent.style.height = 'auto';
        parent.style.padding = '4px 10px';
        parent.style.margin = '6px 0px 6px 0px';
    } else {
        annotation.style.visibility = 'hidden';
        annotation.style.height = '0';
        parent.style.visibility = 'hidden';
        parent.style.height = '0px';
        parent.style.padding = '0px';
        parent.style.margin = '0px';
    }
}
