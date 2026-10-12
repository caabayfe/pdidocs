(function executeRule(current, previous /*null when async*/ ) {
    if (current.isNewRecord() && current.getValue('position') != 'content' && (current.getValue('content_icon') || current.getValue('content_tooltip'))) {
        gs.addErrorMessage(gs.getMessage("Content icon and Content tooltip are valid for fields with content type position."));
        current.setAbortAction(true);
    } else if (current.position.changes() && current.getValue('position') != "content") {
        if (current.getValue('content_icon'))
            current.setValue('content_icon', '');
        if (current.getValue('content_tooltip'))
            current.setValue('content_tooltip', '');
    } else if (current.getValue('position') != "content" && (current.content_icon.changes() || current.content_tooltip.changes())) {
        gs.addErrorMessage(gs.getMessage("Content icon and Content tooltip are valid for fields with content type position."));
        current.setAbortAction(true);
    }
})(current, previous);
