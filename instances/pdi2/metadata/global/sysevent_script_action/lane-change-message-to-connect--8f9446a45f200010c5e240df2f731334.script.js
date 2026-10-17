var board = current.board.getRefRecord();
var task = current.task.getRefRecord();
var deepLink = "/$vtb.do?sysparm_board=" + board.sys_id + "&task=" + task.sys_id;
var message = "\"" + task.short_description + "\" ";
var additionalInfo = JSON.parse(event.parm1);
var previousLaneName = additionalInfo.previousLaneName;
var laneType = additionalInfo.laneType;
if (!previousLaneName)
	message += "added";
else
	message += "moved from " + previousLaneName;
message += " to " + current.getDisplayValue(laneType);

var groupForCard = new GlideRecord("live_group_profile");
groupForCard.addQuery("table", "vtb_board");
groupForCard.addQuery("document", current.board);
groupForCard.query();
if (groupForCard.next())
	new GlideCollaborationManager().sendVTBUpdate(groupForCard.sys_id, additionalInfo.userId, message, deepLink);
