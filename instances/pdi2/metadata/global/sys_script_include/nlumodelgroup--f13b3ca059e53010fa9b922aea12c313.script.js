var NLUModelGroup = Class.create();
(function() {

    var tables = NLUConstants.tables;
    var constants = NLUConstants.constants;

    NLUModelGroup.createModelGroup = function(modelProps) {
        var name = modelProps.name;
        var description = modelProps.description;
        var primaryLanguage = modelProps.primaryLanguage || constants.MODEL_DEFAULT_LANG;
        var category = modelProps.category || constants.MODEL_CAT_SEARCH;
        var secondaryLanguages = modelProps.secondaryLanguages || [];
        var priModelId = '';
        priModelId = NLUSystemUtil.createRecord(tables.SYS_NLU_MODEL, {
            'display_name': name,
            'description': description,
            'category': category,
            'language': primaryLanguage
        });
        new NLUModelGroup(priModelId).createSecondaryModels(modelProps, secondaryLanguages);
        return priModelId;
    };

    NLUModelGroup.prototype = {
        initialize: function(priModelId) {
            this.priModelId = priModelId;
            this.nluModel = new NLUModel(this.priModelId);
        },

        isSecondaryModelExists: function(language) {
            var gr = new GlideRecord(tables.SYS_NLU_MODEL);
            gr.addQuery('primary_model', this.priModelId);
            gr.addQuery('language', language);
            gr.query();
            return gr.next() ? true : false;
        },

        getPrimaryLanguage: function() {
            var modelGr = this.nluModel.getGR();
            return modelGr.getValue('language') || constants.MODEL_DEFAULT_LANG;
        },

        createSecondaryModels: function(modelProps) {
            if (!this.priModelId) throw new Error(gs.getMessage('Primary model id does not exist'));
            var secondaryLanguages = modelProps.secondaryLanguages || [];
            var priLanguage = this.getPrimaryLanguage();
            var thisObj = this;
            secondaryLanguages.forEach(function(language) {
                if (!thisObj.isSecondaryModelExists(language) && language !== priLanguage) new NLUModelTranslator(thisObj.priModelId, language).createStubModel();
            });
        },

        enableIntents: function(name, languages) {
            var gr = new GlideRecord(tables.SYS_NLU_INTENT);
            gr.addQuery('model.primary_model', this.priModelId);
            gr.addQuery('model.language', 'IN', languages.join(','));
            gr.setValue('enable', true);
            gr.updateMultiple();
        },

        getModelIds: function(languages) {
            var modelIds = [];
            var gr = new GlideRecord(tables.SYS_NLU_MODEL);
            gr.addQuery('primary_model', this.priModelId);
            gr.addQuery('language', 'IN', languages.join(','));
            gr.query();
            while (gr.next()) modelIds.push(gr.getUniqueValue());
            modelIds.push(this.priModelId);
            return modelIds;
        },

        type: 'NLUModelGroup'
    };
})();
