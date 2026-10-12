var CreatorStudioDataProxy = Class.create();
Object.freeze(CreatorStudioDataProxy.prototype = {
    initialize: function() {},
    update: function(gr, fields) {
        if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
            throw new Error("This must be called from sn_creatorstudio scope");
        }

        for (prop in fields) {
            gr.setValue(prop, fields[prop]);
        }
        return gr.update();
    },
    insert: function(gr, fields) {
        if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
            throw new Error("This must be called from sn_creatorstudio scope");
        }

        for (prop in fields) {
            gr.setValue(prop, fields[prop]);
        }
        return gr.insert();
    },
    deleteRecord: function(gr) {
        if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
            throw new Error("This must be called from sn_creatorstudio scope");
        }
        return gr.deleteRecord();
    },
    type: 'CreatorStudioDataProxy'
});
