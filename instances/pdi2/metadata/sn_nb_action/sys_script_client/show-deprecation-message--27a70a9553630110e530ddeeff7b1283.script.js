function onLoad() {
    if (g_form.isNewRecord()) {
        getMessage("New input generators can't be created anymore.",
            function(translatedMsg) {
                g_form.addErrorMessage(translatedMsg);
            });
    } else {
        getMessage('Input generator is being deprecated. Please replace input generator with Resource generator',
            function(translatedMsg) {
                g_form.addInfoMessage(translatedMsg);
            });
    }
}
