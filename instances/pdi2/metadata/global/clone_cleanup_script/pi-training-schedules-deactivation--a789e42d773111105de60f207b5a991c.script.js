try {
    var ops = new PIPluginPostCloneOperations();
    ops.deactivate();
} catch (error) {
   gs.error(sn_i18n.Message.getMessage("piplugin-clone-cleanup-script","Error while executing Deactivation in Predictive Intelligence Plugin Post clone operations {error}",{error: error}));
}
