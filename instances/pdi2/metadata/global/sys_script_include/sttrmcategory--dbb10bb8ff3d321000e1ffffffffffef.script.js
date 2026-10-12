var STTRMCategory = Class.create();
STTRMCategory.prototype = Object.extendsObject(STTRMCategorySNC, {
    initialize: function(categoryGr, _gs) {
        STTRMCategorySNC.prototype.initialize.call(this, categoryGr, _gs);
    },

    type: 'STTRMCategory'
});
