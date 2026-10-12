var ConvertHomePagesAjax = Class.create();
ConvertHomePagesAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    convertHomepagesToDashboards: function() {
        var selectedSysIds = this.getParameter('sysparm_selected_homepages');
        var dashboardSysIds = new SNC.PortalPagesMigration().convertHomePagesAndgetAssociatedDashboards(selectedSysIds);
        this._displayMessage(dashboardSysIds);
    },

    _displayMessage: function(dashboardSysIds) {
        var msg;
        var length = dashboardSysIds.split(',').length;
        if (length > 0) {
            var tinyUrl = new GlideTinyURL().createTinyURL("pa_dashboards_list.do?sysparm_query=sys_idIN" + dashboardSysIds);
            msg = gs.getMessage('{0} dashboards have been created successfully. Permissions of the homepages were migrated to the new dashboards and stored in the dashboard permissions table. View the results <a href="{1}">here</a>.', [length + '', tinyUrl]);
        } else
            msg = gs.getMessage('No new dashboards were created.');

        gs.addInfoMessage(msg);
    },

    type: 'ConvertHomePagesAjax'
});
