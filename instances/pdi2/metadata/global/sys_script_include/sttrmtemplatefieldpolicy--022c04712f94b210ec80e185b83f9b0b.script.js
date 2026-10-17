var STTRMTemplateFieldPolicy = Class.create();
STTRMTemplateFieldPolicy.prototype = Object.extendsObject(STTRMTemplateFieldPolicySNC, {

    initialize: function(modelGr, _gs) {
        STTRMTemplateFieldPolicySNC.prototype.initialize.call(this, modelGr, _gs);
    },

    type: 'STTRMTemplateFieldPolicy'
});
