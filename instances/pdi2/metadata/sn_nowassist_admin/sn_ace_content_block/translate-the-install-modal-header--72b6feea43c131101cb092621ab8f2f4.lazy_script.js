(function(context, pageParams, blockcontext) {
    // return some_output
    var pluginName = blockcontext.InstallPluginModalHeader;
    var translatedText = gs.getMessage("Install {0} plugins", pluginName);

    return {
        translatedText: translatedText
    }

})(context, pageParams, blockcontext);
