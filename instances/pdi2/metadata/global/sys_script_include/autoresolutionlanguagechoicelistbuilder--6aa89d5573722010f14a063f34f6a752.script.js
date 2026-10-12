var AutoResolutionLanguageChoiceListBuilder = Class.create();
AutoResolutionLanguageChoiceListBuilder.prototype = {

    //Tier-1 languages
    ENGLISH: {
        name: 'English',
        id: 'en'
    },
    FRENCH: {
        name: 'French',
        id: 'fr',
        plugin: 'com.snc.i18n.french'
    },
    GERMAN: {
        name: 'German',
        id: 'de',
        plugin: 'com.snc.i18n.german'
    },
    JAPANESE: {
        name: 'Japanese',
        id: 'ja',
        plugin: 'com.snc.i18n.japanese'
    },
    SPANISH: {
        name: 'Spanish',
        id: 'es',
        plugin: 'com.snc.i18n.spanish'
    },
	PORTUGUESE: { 
        name: 'Portuguese',
        id: 'pt',
        plugin: 'com.snc.i18n.portuguese'		
	},
	DUTCH: {
        name: 'Dutch',
        id: 'nl',
        plugin: 'com.snc.i18n.dutch'		
	},
	ITALIAN: {
        name: 'Italian',
        id: 'it',
        plugin: 'com.snc.i18n.italian'
	},

    initialize: function() {
        this.supportedNonEnglishLanguages = [this.FRENCH, this.GERMAN, this.JAPANESE, this.SPANISH, this.PORTUGUESE, this.DUTCH, this.ITALIAN];
    },

    getSupportedLanguages: function() {
        var activeLanguages = this._getActiveLanguageList();
        var list = new GlideChoiceList();
        for (i = 0; i < activeLanguages.length; i++)
            list.add(new GlideChoice(activeLanguages[i].id, activeLanguages[i].name));
        return list;
    },
    getSupportedLanguagesForUIB: function() {
        try {
            var activeLanguages = this._getActiveLanguageList();
            var uibList = [];
            activeLanguages.forEach(function(language) {
                uibList.push({
                    'id': language.id,
                    'label': language.name
                });
            });
            return uibList;
        } catch (e) {
            return [];
        }
    },

    _getActiveLanguageList: function() {
        var activeLanguages = [];
        // By default, we add the english language to the list of active languages
        activeLanguages.push(this.ENGLISH);

        var multiLanguageSupportEnabled = gs.getProperty(
            AutoResolutionConstants.AUTO_RESOLUTION_ENABLE_MULTI_LANGUAGE_SUPPORT_PROPERTY, 'false') === 'true';
        if (!multiLanguageSupportEnabled)
            return activeLanguages;

        for (var i = 0; i < this.supportedNonEnglishLanguages.length; i++) {
            if (this._isLanguagePackActive(this.supportedNonEnglishLanguages[i].plugin))
                activeLanguages.push(this.supportedNonEnglishLanguages[i]);
        }

        return activeLanguages;
    },

    _isLanguagePackActive: function(pluginId) {
        return GlidePluginManager.isActive(pluginId);
    },

    type: 'AutoResolutionLanguageChoiceListBuilder'
};
