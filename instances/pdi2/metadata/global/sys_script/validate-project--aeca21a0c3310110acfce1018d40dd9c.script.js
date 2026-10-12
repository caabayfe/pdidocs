(function executeRule(current, previous /*null when async*/ ) {
    var errorMsg = "";
    if (current.job.sys_domain != current.project.sys_domain) {
        errorMsg = gs.getMessage("Cannot add '{0}' because the project does not belong to the Scheduled Job's domain. Please add projects only from '{1}' domain.", [current.project.name, current.job.sys_domain.getDisplayValue()]);
    } else {
        var grJobProject = new GlideRecord('promin_job_m2m_project');
        grJobProject.addQuery('project', current.project);
        grJobProject.queryNoDomain();
        if (grJobProject.next()) {
            errorMsg = gs.getMessage("The project '{0}' is already added in <a href='{1}' target='_blank'> {2} </a> Job.",
                [grJobProject.project.name, grJobProject.job.getRefRecord().getLink(), grJobProject.getDisplayValue('job')]);
        }
    }
    if (errorMsg != "") {
        gs.addErrorMessage(errorMsg);
        current.setAbortAction(true);
    }
})(current, previous);
