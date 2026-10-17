var from = document.getElementById("from").value;
var progressTrackerCompleted = false;
var UninstallAppDialog = Class.create({

    initialize: function() {
        if (typeof $('ok_button') === 'object' && $('ok_button') !== null)
            $('ok_button').focus();
        else
            $('cancel_button').focus();
    },

    isUninstallFromAppDetail: function() {
        return from == 'appDetailPage';
    },

    uninstallApp: function() {

        if (this.isUninstallFromAppDetail()) {
            window.reconfimMsg = "reconfirmSuccess";

        } else if (!this.reconfirm(new GwtMessage().getMessage("To uninstall the application"))) {
            this.initialize();
            window.reconfimMsg = "reconfirmFailed";
            return false;
        } else {
            window.reconfimMsg = "reconfirmSuccess";
        }

        var deleteAll = gel('uninstall_app_dialog');
        var appId = '${JS:sysparm_sys_id}';
        var sharedInternally = '${JS:sysparm_shared_internally}';
        var redirect = true;
        if ('${JS:sysparm_redirect}' === '0')
            redirect = false;
        var workerId;
        var refreshNav = false;

        if (this.isUninstallFromAppDetail())
            CustomEvent.fireTop("app_manager.uninstall-modal", {
                isLoading: true
            });

        var dd = new GlideModal("hierarchical_progress_viewer");
        dd.on("executionStarted", function(response) {
            workerId = response.responseXML.documentElement.getAttribute("answer");
            CustomEvent.fireTop("app_manager.close-uninstall-modal", {
                "tracker": workerId
            });
            refreshNav = response.responseXML.documentElement.getAttribute("refresh_nav");
        });
        dd.on("executionComplete", function(trackerObj) {
            if(gs.getProperty("glide.apps.force_sync_post_install_or_uninstall", 'true') == 'false') {
                var gr = new GlideAjax("AppClientCacheHelper");
                gr.addParam("sysparm_name", "refreshAppManagerCache");
                gr.addParam('sysparm_source_app_id', appId);
                gr.addParam('sysparm_shared_internally', sharedInternally);
                gr.getXMLWait();
            }
            progressTrackerCompleted = true;
        });
        dd.on("beforeclose", function() {
            this.exitCompleted(workerId, appId, refreshNav, redirect);
        }.bind(this));

        dd.setTitle("Progress");
        dd.setPreference('sysparm_function', 'uninstallApplication');
        dd.setPreference('sysparm_sys_id', appId);
        dd.setPreference('sysparm_plugin_id', '${JS:sysparm_plugin_id}');
        var del = $('cb') ? !$('cb').checked : true; // if !retained, delete
        dd.setPreference('sysparm_delete_all', del);
        dd.setPreference('sysparm_progress_name', "Uninstalling application");
        dd.setPreference('sysparm_ajax_processor', 'com.snc.apps.AppsAjaxProcessor');
        dd.setPreference('sysparm_show_done_button', 'true');

        dd.render();


        return dd;
    },

    exit: function() {
        if (from == 'appDetailPage') {
            CustomEvent.fireTop("app_manager.close-uninstall-modal");
            return;
        }
        GlideDialogWindow.get().destroy();
    },

    singleExit: function() {
        GlideDialogWindow.prototype.locate(this).destroy();
        return false;
    },

    reconfirm: function(message) {
        var keyword = new GwtMessage().getMessage("uninstall").toLowerCase();
        var fieldMsg = new GwtMessage().getMessage("Type the word \"uninstall\" here");
        var name = prompt(message, fieldMsg);
        if (!name || name.toLowerCase() != keyword)
            return false;

        return true;
    },

    exitCompleted: function(workerId, appId, refreshNav, redirect) {
        // If we changed any menu structure, refresh the nav
        if (refreshNav)
            CustomEvent.fireTop('navigator.refresh');

        var sharedInternally = '${JS:sysparm_shared_internally}';

        // Always refresh app picker when we uninstall an app
        var top = getTopWindow();
        if (typeof top.g_application_picker != 'undefined')
            top.g_application_picker.fillApplications();

        var url = "";

        if (from == 'appDetailPage') {
            CustomEvent.fireTop("app_manager.close-uninstall-modal");
            if (progressTrackerCompleted)
                window.parent.location.reload();
            return;
        }

        if (redirect) {
            if (sharedInternally == 'true')
                url = new GlideURL('$mycompanyappsmgmt.do');
            else
                url = new GlideURL('now/app-manager/home');
            window.location.replace(url.getURL());
        } else
            window.location.reload();
    }
});

$('uninstall_app_dialog_container').observe('keyup', test);

function test(event) {
    if (event.keyCode == 27) // escape
        gUninstallAppDialog.exit();
}

var gUninstallAppDialog = new UninstallAppDialog();
