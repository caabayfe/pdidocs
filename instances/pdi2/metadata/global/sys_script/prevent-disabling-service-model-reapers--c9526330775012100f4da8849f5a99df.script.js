(function executeRule(current, previous /*null when async*/) {  
var operation = current.operation();
if (operation == 'delete' || (operation == 'update' && previous.active == true && current.active == false)) {
        gs.addErrorMessage(gs.getMessage('Error. To ensure optimal system performance, do not disable or delete the Checkpoint Reaper or the Blob Reaper.'));
        current.setAbortAction(true);
    }
})(current, previous);
