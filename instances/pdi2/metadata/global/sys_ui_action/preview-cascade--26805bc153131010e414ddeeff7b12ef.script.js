if (current.condition.changes() || current.table.changes())
    current.update();

var dmAPI = new SNC.DataManagementAPI();
var errorMessage = dmAPI.hasRightToExecute(current);
if (errorMessage != null) {
    gs.addErrorMessage(errorMessage);
    gs.setRedirect("sys_dm_delete.do?sys_id=" + current.sys_id);
} else {
    var has_more_cascade_level = dmAPI.createPreviewCascadeCounts(current);

    if (has_more_cascade_level) {
        var max_level = GlideProperties.get("glide.cascade.preview_max_level") || 3;
        var message = '<p style="color:black;background-color:orange;">';
        var preview_message = gs.getMessage("Data Management Preview Cascade", max_level);

        message += preview_message;
        gs.addInfoMessage(message);
    }
    gs.addInfoMessage(gs.getMessage("Preview cascade is a close-to estimate, the latest inserted record may not be shown due to replication lag"));
    gs.setRedirect("sys_dm_delete.do?sys_id=" + current.sys_id);
}
