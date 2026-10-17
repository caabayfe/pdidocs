(function executeRule(current, previous /*null when async*/ ) {
    current.frequency += 1;
    current.update();
})(current, previous);
