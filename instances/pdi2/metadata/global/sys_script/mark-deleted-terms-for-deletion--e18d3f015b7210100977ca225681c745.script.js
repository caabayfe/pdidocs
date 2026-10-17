(function executeRule(current, previous /*null when async*/ ) {

    if (current.marked_for_deletion != true) {
        current.marked_for_deletion = true;
        current.update();
        // Dictionary terms will be deleted when the Dictionary is next published
        current.setAbortAction(true);
    }

})(current, previous);
