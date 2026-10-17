(function executeRule(current, previous /*null when async*/ ) {

    if (current.todo_filter.is_filter_group == true) {
        gs.addErrorMessage(gs.getMessage('Filter groups can not have Associated conditions'));
        current.setAbortAction(true);
    }

})(current, previous);
