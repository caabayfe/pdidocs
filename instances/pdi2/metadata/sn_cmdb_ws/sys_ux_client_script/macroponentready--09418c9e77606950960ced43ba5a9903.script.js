function script({ api, event, helpers, imports }) {
    //macroponentReady script in Properties UI Controller; fired on page load

    var functions = {

        macroponentReady: function () {
            this.setTranslationsIntoState();
        },

        setTranslationsIntoState: async function () {
            //this will set into client state so they only have to be translated once and 
            // also so they can be shared and are consistent across the module
            //Additionally, using client state allows for them to be accessed from anywhere 
            // since presets, formulae, or inline scripts cannot access cilent script includes
            var translations = {
                NONE: await helpers.translate('None'),
                MULTIPLE_TEXT: await helpers.translate("Multiple")
            };

            api.setState('translations', translations);
        }
    };
    
    functions.macroponentReady();
}
