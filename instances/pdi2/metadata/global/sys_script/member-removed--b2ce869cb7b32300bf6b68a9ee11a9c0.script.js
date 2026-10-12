(function executeRule(current, previous /*null when async*/ ) {
    if (current.board.getDisplayValue()) { // To check that it is not triggered by board delete.
        var user_id = current.user;
        var board_name = current.board.getDisplayValue();
        gs.eventQueue('vtb_board_member.deleted', null, user_id, board_name);
    }
})(current, previous);
