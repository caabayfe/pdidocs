var ContextualPanelInteractionVisibility = Class.create();
ContextualPanelInteractionVisibility.prototype = Object.extendsObject(ContextualPanelInteractionVisibilitySNC, {
    initialize: function() {
        ContextualPanelInteractionVisibilitySNC.prototype.initialize.call(this);
    },

    type: 'ContextualPanelInteractionVisibility'
});
