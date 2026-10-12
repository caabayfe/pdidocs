function transform(input) {

    function getAllPOProjects(content_tree) {
        if (!content_tree.hasOwnProperty("children")) {
            var projectId = sdPOUtils.getPOProjectId(content_tree.id);
            if (projectId && projectIds.indexOf(projectId) == -1)
                projectIds.push(projectId);
            return;
        }
        content_tree.children.forEach(function(eachChild) {
            getAllPOProjects(eachChild);
        });
    }

    function getPOProjectDetails(projectId) {
        var projectDetails = {};
        projectDetails.projectId = projectId.toString();
        projectDetails.table = sdPOUtils.getPOProjectEntityTable(projectId).label.toString();
        projectDetails.canRead = sdPOUtils.getPOProjectEntityTable(projectId).canRead;
        var versionFields = sdPOUtils.getLatestPOProjectVersionFields(projectId);
        projectDetails.version = versionFields.version.toString();
        projectDetails.total_records = parseInt(versionFields.total_records);
        return projectDetails;
    }

    var sdHelperUtils = new sn_sd.SDHelperUtils();
    var sdPOUtils = new sn_sd.SDProcessOptimizationHelperUtils();
    var output = [];
    var projectIds = [];
    var sysId = input.sysId;

    if (!sysId)
        return '';
    if (sdHelperUtils.getIndicatorLevel(sysId) == "contributing") {
        var projectId = sdPOUtils.getPOProjectId(sysId);
        if (projectId)
            projectIds.push(projectId);
    } else {
        var payload = {};
        payload.uuid = sysId;
        payload.selectedId = null;
        payload.buValue = sdHelperUtils.getServiceGroup(sysId);
        payload.playbook = "false";
        payload.showInactiveKPIs = false;
        payload.skipCheck = true;
        var content_tree = new sn_sd.ContentTreeUtil().createCountContentTree(payload)[0].content_tree[0];
        getAllPOProjects(content_tree);
    }

    for (var i = 0; i < projectIds.length; i++) {
        var projectDetails = getPOProjectDetails(projectIds[i]);
        output.push(projectDetails);
    }
    if (output.length == 0)
        return '';

    // For August 5.0 release, only one project is considered.
    return output[0];

}
