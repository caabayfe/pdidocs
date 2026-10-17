var STTRMModel = Class.create();
STTRMModel.prototype = Object.extendsObject(STTRMModelSNC, {

    initialize: function(modelGr, _gs) {
        STTRMModelSNC.prototype.initialize.call(this, modelGr, _gs);
    },

    type: 'STTRMModel'
});

STTRMModel.clearCache = STTRMModelSNC.clearCache;
