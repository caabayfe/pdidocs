if (gs.hasRole('nlu_admin')) {
    answer = true;
} else if (gs.hasRole('nlu_editor') && NLUBatchTestSet.canUserCreateUpdateRecord) {
    answer = NLUBatchTestSet.canUserCreateUpdateRecord(current.test_set, gs.getUserID());
} else {
    answer = false;
}
