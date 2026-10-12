var ContextualPanelRequestVisibility = Class.create();
ContextualPanelRequestVisibility.prototype = Object.extendsObject(ContextualPanelRequestVisibilitySNC, {
    initialize: function() {
        ContextualPanelRequestVisibilitySNC.prototype.initialize.call(this);
    },

    type: 'ContextualPanelRequestVisibility'
});
