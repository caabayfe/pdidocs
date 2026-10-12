var STTRMBaseTemplate = Class.create();
STTRMBaseTemplate.prototype = Object.extendsObject(STTRMBaseTemplateSNC, {

    initialize: function(templateGr, _gs) {
        STTRMBaseTemplateSNC.prototype.initialize.call(this, templateGr, _gs);
    },

    type: 'STTRMBaseTemplate'
});
