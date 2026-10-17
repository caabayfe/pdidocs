try {
    var ops = new PIPluginPostCloneOperations();
    ops.reactivate();
} catch (error) {
   gs.error(sn_i18n.Message.getMessage("piplugin-clone-cleanup-script","Error while executing Reactivation in Predictive Intelligence Plugin Post clone operations {error}",{error: error}));
}
