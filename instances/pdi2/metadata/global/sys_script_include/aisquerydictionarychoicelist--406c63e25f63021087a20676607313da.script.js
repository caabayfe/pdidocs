var AisQueryDictionaryChoiceList = Class.create();
AisQueryDictionaryChoiceList.prototype = {
    initialize: function() {},

    getDictionaryNamesByType: function(types) {
        var dictionaryGr = new GlideRecord('ais_dictionary');
        dictionaryGr.addQuery('type', types);
        dictionaryGr.query();
        var choiceList = new GlideChoiceList();
        while (dictionaryGr.next()) {
            choiceList.add(dictionaryGr.name, dictionaryGr.label);
        }
        return choiceList;
    },

    getSynonymAndStopwordDictionaries: function() {
        return this.getDictionaryNamesByType(['SYNONYM', 'STOPWORD']);
    },

    type: 'AisQueryDictionaryChoiceList'
};
