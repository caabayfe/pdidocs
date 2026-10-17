function onDelete() {
    var gdw;
    if (typeof g_form !== 'undefined') {
        gdw = new GlideDialogWindow('delete_hermes_topic_confirm');
        gdw.setTitle(getMessage('Confirmation'));
        gdw.setPreference('onPromptComplete', function callback() {
            gsftSubmit(null, g_form.getFormElement(), 'sysverb_delete');
        });
        gdw.render();
    } else if (typeof g_list !== 'undefined') {
        gdw = new GlideDialogWindow('delete_hermes_topic_confirm');
        var deleteCallback = function() {
            var checked = this.g_list.getChecked();
            if (!checked) {
                alert('No rows checked.');
                return;
            }
            var ga = new GlideAjax('HermesTopicDeleter');
            ga.addParam('sysparm_name', 'deleteRecords');
            ga.addParam('sysparm_ids', checked);
            ga.getXML(function(_) {
                this.g_list.refresh();
            }.bind(this));
        };
        deleteCallback = deleteCallback.bind({
            g_list: g_list
        });
        gdw.setPreference('onPromptComplete', deleteCallback);
        gdw.render();
    } else {
        // Fallback for unexpected cases
        alert("Unable to determine context for deletion.");
    }
}
