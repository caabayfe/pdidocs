var global = new global.ACEAppBuilderGlobalScopedUtil();
if (global.enableAIS()) {
    gs.addInfoMessage(gs.getMessage('AI Search is requested. Please note that it may take some time for the AI Search application to be activated.'));
} else {
    gs.addInfoMessage(gs.getMessage('Unable to place AI search request. Please try again later.'));
}
