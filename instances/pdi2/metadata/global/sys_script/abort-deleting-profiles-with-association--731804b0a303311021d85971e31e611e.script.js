(function executeRule(current, previous /*null when async*/ ) {

    // If there are existing topics associated with this context profile, abort the delete
    // else there would be an invalid reference in sys_cb_topic.context_profiles
    var designerUtils = new sn_cs.VADesignerUtils();
    var listOfTopicStatus = designerUtils.topicsAssociatedWithContextProfile(current.sys_id);
    if (listOfTopicStatus.length > 0) {
        current.setAbortAction(true);
        var arrayOfTopicNames = [];
        for (var i = 0; i < listOfTopicStatus.length; ++i) {
            arrayOfTopicNames.push(listOfTopicStatus[i].name);
        }
        gs.addErrorMessage(sn_i18n.Message.getMessage("va", "Cannot delete '{contextProfileName}' because there are still topics associated. The associated topics are: {listOfTopicNames}", {
            contextProfileName: current.name,
            listOfTopicNames: arrayOfTopicNames.toString()
        }));
    }
})(current, previous);
