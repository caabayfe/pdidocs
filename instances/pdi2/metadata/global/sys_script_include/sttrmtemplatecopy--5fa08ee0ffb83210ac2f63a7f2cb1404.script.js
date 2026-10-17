var STTRMTemplateCopy = Class.create();
STTRMTemplateCopy.prototype = Object.extendsObject(STTRMTemplateCopySNC,{
    initialize: function(originalChangeTemplateGr) {
		STTRMTemplateCopySNC.prototype.initialize.call(this, originalChangeTemplateGr);
    },

    type: 'STTRMTemplateCopy'
});
