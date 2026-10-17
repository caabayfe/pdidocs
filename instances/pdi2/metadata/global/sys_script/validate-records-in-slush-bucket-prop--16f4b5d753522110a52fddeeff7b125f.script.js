(function executeRule(current, previous /*null when async*/) {
var numberOfRecordsInSlushBucket = current.value;
if (numberOfRecordsInSlushBucket === '' || isNaN(numberOfRecordsInSlushBucket)) {
    gs.addErrorMessage(gs.getMessage("Please enter numerical values only"));
	current.setAbortAction(true);
} else if (numberOfRecordsInSlushBucket < 10 || numberOfRecordsInSlushBucket > 5000) {
   gs.addErrorMessage(gs.getMessage("Please enter numerical values in the range between 10 and 5000"));
   current.setAbortAction(true);
}
})(current, previous);
