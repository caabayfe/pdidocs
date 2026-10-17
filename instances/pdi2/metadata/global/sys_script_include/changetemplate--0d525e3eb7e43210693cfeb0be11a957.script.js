var ChangeTemplate = Class.create();
ChangeTemplate.prototype = Object.extendsObject(ChangeTemplateSNC, {

    initialize: function(templateGr, _gs) {
        ChangeTemplateSNC.prototype.initialize.call(this, templateGr, _gs);
    },

    type: 'ChangeTemplate'
});

ChangeTemplate.getReferenceQualifier = ChangeTemplateSNC.getReferenceQualifier;
