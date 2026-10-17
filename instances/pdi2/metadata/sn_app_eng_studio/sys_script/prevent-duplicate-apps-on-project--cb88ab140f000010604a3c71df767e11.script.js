(function executeRule(current, previous /*null when async*/ ) {

    var m2m = new GlideRecord('sn_app_eng_studio_project_application_m2m');
    m2m.addQuery('project', current.project);
    m2m.addQuery('application', current.application);
    m2m.query();

    if (m2m.next() && m2m.project) {
        current.setAbortAction(true);
        gs.addInfoMessage(gs.getMessage("Duplicate applications cannot be added to a project."));
    }

})(current, previous);
