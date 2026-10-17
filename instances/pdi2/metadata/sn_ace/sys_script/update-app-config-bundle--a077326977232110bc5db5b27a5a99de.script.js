(function executeRule(current, previous /*null when async*/ ) {

    var util = new ACEAppBuilderUtil();
    var contentBlocks = util.getAceAppDataToBundle(current.getValue('ace_config'));
    var aceAppConfig = current.ace_config.getRefRecord();
    var aceGlobalUtil = new global.ACEAppBuilderGlobalScopedUtil();
    var bundle = aceGlobalUtil.getCompressedPageBundle(contentBlocks);
    aceAppConfig.setValue('bundle', bundle);
    aceAppConfig.update();

})(current, previous);
