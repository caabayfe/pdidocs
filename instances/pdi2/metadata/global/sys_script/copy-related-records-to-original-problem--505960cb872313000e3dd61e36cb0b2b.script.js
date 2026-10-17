(function executeRule(current, previous /*null when async*/ ) {
    var problemUtil = new ProblemV2Util();
    var recordsToMove = gs.getProperty("problem.duplicate.records_to_move");
    var recordsMap = problemUtil.dotCommaToMap(recordsToMove.split(","));
    var originalProblemGr = current.duplicate_of.getRefRecord();
    var record;
    for (record in recordsMap) {
		// The records for problem_task(s) are handled via the BR - 'Cascade closure of Problem Tasks' - DEF0190002
        if (record === 'problem_task')
            continue;
        problemUtil.moveRecords(record, recordsMap[record], current, originalProblemGr);
    }
    originalProblemGr.work_notes = gs.getMessage("{0} was marked as a duplicate of this Problem", current.getDisplayValue());
    originalProblemGr.update();
})(current, previous);
