function findChanges() {
    var ga = new GlideAjax("ATFTracingHelperAjax");
    ga.addParam('sysparm_name', 'getTrackerId');
    ga.addParam('sysparam_sys_id', g_form.getUniqueValue());
    ga.getXMLAnswer(function(answer) {
        if (answer) {
            var modal = new GlideModal("hierarchical_progress_viewer");
            modal.setTitle(new GwtMessage().getMessage("Loading changes since last successful run"));
            modal.setPreference("sysparm_renderer_execution_id", answer);

            // When the tracker is complete, automatically close it and refresh the related list to show performance stats
            modal.on("executionComplete", function() {
                gsftSubmit(null, g_form.getFormElement(), 'find_changes_since_last_successful_run');
                modal.destroy();
            });

            modal.render();
        } else {
            gsftSubmit(null, g_form.getFormElement(), 'find_changes_since_last_successful_run');
        }
    });


}

if (typeof window == 'undefined')
    serverReopen();

function serverReopen() {
    var url = current.getLink();
    url += "&sysparm_find_changes=true";
    action.setRedirectURL(url);
    sn_atf.TracedMetadataChangeFinder.findChanges(current, null);
}
