(function executeRule(current, previous /*null when async*/ ) {

    var grProject = new GlideRecord("promin_project");
    if (grProject.get(current.project)) {
        grProject.setValue("status", "PUBLISHED");
        grProject.setWorkflow(false);
        grProject.update();
    }

})(current, previous);
