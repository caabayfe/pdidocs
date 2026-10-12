//Define previous and current additional assignee lists
var prevList = previous.additional_assignee_list.split(",");
var currList = current.additional_assignee_list.split(",");

//Get new additional assigneed who is recipient of resulting email notification
var arrayUtil = new ArrayUtil();
var sendTo = arrayUtil.diff(currList, prevList);

function onAfter(current, previous) {
    gs.eventQueue("vtb_task.previous.additional_assignee", current, sendTo, current.sys_id);
}
