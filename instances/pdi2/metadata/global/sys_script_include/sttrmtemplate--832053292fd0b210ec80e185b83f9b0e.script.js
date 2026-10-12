var STTRMTemplate = Class.create();
STTRMTemplate.prototype = Object.extendsObject(STTRMTemplateSNC, {

    initialize: function(templateGr, _gs) {
        STTRMTemplateSNC.prototype.initialize.call(this, templateGr, _gs);
    },

    type: 'STTRMTemplate'
});
