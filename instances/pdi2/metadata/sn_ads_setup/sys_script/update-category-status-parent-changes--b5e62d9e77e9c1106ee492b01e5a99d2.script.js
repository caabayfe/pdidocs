(function executeRule(current, previous /*null when async*/ ) {
    //status - 0 - Done, 1 - Basic Info, 2 - Configure task , 3 - Task setting 
    // Handles category status, if the name & description provided 
    var setupUtil = new SNHelpSetupUtil();
    var isNameEmpty = current.name.toString() == '';
    var isDescEmpty = current.description.toString() == '' && current.rich_description.toString() == '';
    if (setupUtil.isAllTasksCompleted(current.sys_id) && !isNameEmpty && !isDescEmpty)
        current.status = '0';
    else if (setupUtil.isAnyTaskStarted(current.guidance, current.sys_id))
        current.status = '3';
    else if (!isNameEmpty && !isDescEmpty)
        current.status = '3';
    else
        current.status = '1';
})(current, previous);
