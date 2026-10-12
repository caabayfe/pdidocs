(function executeRule(current, previous /*null when async*/ ) {
    var errorMsg = "";
    if (current.job.sys_domain != current.project.sys_domain) {
        errorMsg = gs.getMessage("Cannot add '{0}' because the project does not belong to the Scheduled Job's domain. Please add projects only from '{1}' domain.", [current.project.name, current.job.sys_domain.getDisplayValue()]);
    } else {
        var grJobModelDef = new GlideRecord('promin_job_m2m_model_def');
        grJobModelDef.addQuery('project', current.project);
        grJobModelDef.queryNoDomain();
        if (grJobModelDef.next()) {
            errorMsg = gs.getMessage("The project '{0}' is already added in <a href='{1}' target='_blank'> {2} </a> Job.",
                [grJobModelDef.project.name, grJobModelDef.job.getRefRecord().getLink(), grJobModelDef.getDisplayValue('job')]);
        }
    }
    if (errorMsg != "") {
        gs.addErrorMessage(errorMsg);
        current.setAbortAction(true);
    }
})(current, previous);
