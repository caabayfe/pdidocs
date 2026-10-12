(function(current, action) {
    var newTemplateSysId = new STTRMTemplateCopy(current).createCopy({
        retirePreviousTemplateOnPublish: true
    });
    var newModelURL = current.getValue("sys_class_name") + ".do?sysparm_nostack=true&sysparm_ignore_class=true&sys_id=" + newTemplateSysId;
    action.setRedirectURL(newModelURL);
})(current, action);
