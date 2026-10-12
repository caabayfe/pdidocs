function transform(input) {
    var util = new sn_ace.ACEAppBuilderUtilV2();
    if (input.isNewPage) 
        util.createContentBlock(input.aceAppConfig, input.pageId);
    
    var context = util._patchPage(input.aceAppConfig, input.pageId, input.macroponentId, input.screenType, input.rootMacroponent, input.isNewPage);
}
