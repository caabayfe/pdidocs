(function() {
    current.update();
    try {
        var deployRequest = new global.MIDDeploymentRequest(current.sys_id);
        if (!deployRequest.isStatefulSet()) {
            var midServerNames = deployRequest.generateMIDServerNames();
            var midNameList = global.MIDDeploymentRequest.toArray(midServerNames);
            deployRequest.validateMIDServerNames(midNameList);
        }
        var filename = current.number + ".yml";
        var mdu = new SNC.MIDDeploymentUtil();
        var yamlFile = mdu.generateK8sYAML(current.sys_id);
        if (yamlFile) {
            var attachment = new Attachment();
            attachment.write(current.getTableName(), current.sys_id, filename, 'text/plain', yamlFile);
            current.setValue('state', 'exported');
            current.setValue('processed_at', new GlideDateTime());
            current.update();
            gs.addInfoMessage(gs.getMessage("MID export YAML file - File attached", filename));
        } else
            gs.addErrorMessage(gs.getMessage("MID export YAML file - Failed to generate YAML file"));
    } catch (e) {
        gs.addErrorMessage(gs.getMessage("MID export YAML file - Failed with error: {0}", e));
    }
    action.setRedirectURL(current);
})();
