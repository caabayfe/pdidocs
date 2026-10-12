(function executeRule(current, previous /*null when async*/ ) {
    if (current.timezone == previous.timezone)
        return;
    gs.eventQueue('spm.availability.calculate', current);
})(current, previous);
