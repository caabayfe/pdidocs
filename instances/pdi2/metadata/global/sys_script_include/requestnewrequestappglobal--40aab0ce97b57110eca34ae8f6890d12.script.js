var RequestNewRequestAppGlobal = Class.create();
RequestNewRequestAppGlobal.prototype = {
    setJournalEntry: function(gr, additional_comment) {
        if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
            throw new Error(gs.getMessage("RequestNewRequestAppGlobal must be called from sn_creatorstudio scope"));
        }
        gr.comments.setJournalEntry(additional_comment);
    },

    type: 'RequestNewRequestAppGlobal'
};
