(function executeRule(current, previous /*null when async*/ ) {

    if (!gs.nil(current.parent_item)) {
        current.portal_extensible_navigation = current.parent_item.portal_extensible_navigation;
    } else {
        current.setAbortAction(true);
    }

})(current, previous);
