if (current.uncancelable) {
    gs.addErrorMessage(gs.getMessage('This system transaction is designated as uncancelable. To kill it, you must force kill it by entering the record.'));
} else {
    GlideTransactionManager.kill(current.session_id);
    gs.addInfoMessage(gs.getMessage('Kill message sent to user transaction {0} against {1}',[current.user, current.url]));
    gs.addInfoMessage(gs.getMessage('Transaction may not terminate immediately'));
}
