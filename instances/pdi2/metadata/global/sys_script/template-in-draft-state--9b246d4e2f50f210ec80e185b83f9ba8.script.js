(function executeRule(current, previous /*null when async*/ ) {

    function isDraft() {

        // Check if parent has run out on us
        var parentTemplateGr = null;
        try {
            parentTemplateGr = parent;
        } catch (e) {
            parentTemplateGr = null;
        }

        var state = null;

        if (parentTemplateGr && GlideDBObjectManager.get().getAllExtensions("sttrm_base_template").indexOf(parentTemplateGr.getTableName()) !== -1)
            state = new STTRMBaseTemplate(parentTemplateGr).getState();

        if (!state)
            state = new STTRMBaseTemplate(current.sttrm_base_template.getRefRecord()).getState();

        return state === "draft";
    }

    if (!isDraft()) {
        gs.addErrorMessage(gs.getMessage("Templates must be in draft state."));
        current.setAbortAction(true);
    }

})(current, previous);
