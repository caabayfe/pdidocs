(function executeRule(current, previous /*null when async*/ ) {
    //Triggers when step status changes from inprogress to done or done to any
    //Checks all the tasks for the given category is done, marks category to done else in progress 
    //status - 0 - Done, 1 - Basic Info, 2 - Configure task , 3 - Task setting 
    var setupUtil = new SNHelpSetupUtil();
    var isNameEmpty = current.parent.name.toString() == '';
    var isDescEmpty = current.parent.description.toString() == '' && current.parent.rich_description.toString() == '';
    var isStepNameEmpty = current.name.toString() == '';
    var isStepDescEmpty = current.description.toString() == '' && current.rich_description.toString() == '';
    if (current.operation() == "delete") {
        if (setupUtil.isAllTasksCompleted(current.parent) && !isNameEmpty && !isDescEmpty) {
            setupUtil.setStepStatus(current.parent, '0');
        } else if (setupUtil.isAnyTaskStarted(current.guidance, current.parent))
            setupUtil.setStepStatus(current.parent, '3');
        else {
            setupUtil.setStepStatus(current.parent, '1');
        }
    } else {
        if (isStepNameEmpty || isStepDescEmpty) {
            setupUtil.setStepStatus(current.sys_id, '1');
            setupUtil.setStepStatus(current.parent, '3');
        } else if (current.status.toString() !== '0') {
            setupUtil.setStepStatus(current.parent, '3');
        } else if (setupUtil.isAllTasksCompleted(current.parent) && !isNameEmpty && !isDescEmpty) {
            setupUtil.setStepStatus(current.parent, current.status);
        }
		else
			setupUtil.setStepStatus(current.parent, '3');
        // update previous parent state when reordering
        if (current.parent != previous.parent) {
            var ispreviousParentNameEmpty = previous.parent.name.toString() == '';
            var ispreviousParentDescEmpty = previous.parent.description.toString() == '' && previous.parent.rich_description.toString() == '';
            if (setupUtil.isAllTasksCompleted(previous.parent) && !ispreviousParentNameEmpty && !ispreviousParentDescEmpty) {
                setupUtil.setStepStatus(previous.parent, '0');
            } else if (setupUtil.isAnyTaskStarted(previous.guidance, previous.parent))
                setupUtil.setStepStatus(previous.parent, '3');
            else {
                setupUtil.setStepStatus(previous.parent, '1');
            }
        }
    }
})(current, previous);
