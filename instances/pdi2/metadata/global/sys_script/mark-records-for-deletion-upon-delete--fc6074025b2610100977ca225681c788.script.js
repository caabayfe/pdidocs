(function executeRule(current, previous /*null when async*/ ) {

    if (current.marked_for_deletion != true) {
        current.marked_for_deletion = true;
        current.update();
        // The link between this dictionary and the Search Profile will be removed when the Search Profile is next published
        current.setAbortAction(true);
    }

})(current, previous);
