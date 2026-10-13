var OnCallContactPrefTemplate = Class.create();
OnCallContactPrefTemplate.prototype = Object.extendsObject(OnCallContactPrefTemplateSNC, {
    initialize: function() {
		OnCallContactPrefTemplateSNC.prototype.initialize.call(this);
    },

    type: 'OnCallContactPrefTemplate'
});
