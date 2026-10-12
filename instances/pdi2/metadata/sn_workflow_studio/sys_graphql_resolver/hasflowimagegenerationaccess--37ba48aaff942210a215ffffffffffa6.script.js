(function process( /*ResolverEnvironment*/ env) {

    var isText2FlowPluginActive = GlidePluginManager().isActive('com.sn.text2flow');
    if (!isText2FlowPluginActive) return false;

    var doesUserHaveAccess = new sn_text2flow.TextToFlowHelper().isImageToFlowEnabled();
    return doesUserHaveAccess;
})(env);
