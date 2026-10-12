/**
 * Script executed on the Client for this menu action
 *
 * The following variables are available to the script:
 *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
 *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
 *    'g_fieldLabel' the label of the field that the context menu is running against (only valid for List context menus)
 *    'g_sysId' the sys_id of the row or form that the script is running against
 *    'rowSysId' is also set to the sys_id of the row to support legacy actions, but g_sysId is preferred
 */
 
var checkpoints = g_user.getClientData("checkpoints") || {};
var trackedFiles = g_user.getClientData("trackedFiles") || {};
var bsId = g_user.getClientData("bsId") || "";
var checkpoint = checkpoints[g_sysId] || {};
var trackedFile = trackedFiles[checkpoint.ciId];

var url = "$sa_tracked_config_files_diff.do?";

var params = [];
params.push("sysparm_stack=no");
params.push("bs_id=" + bsId);
params.push("tracked_file_id=" + checkpoint.ciId);
params.push("timestamp=" + checkpoint.timestamp);

if (trackedFile) {
	params.push("tracked_file_stable_id=" + encodeURIComponent(trackedFile.stableId || ""));
	params.push("file_name=" + encodeURIComponent(trackedFile.name || ""));
}

url += params.join("&");

window.open(url, "_blank");
