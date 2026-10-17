var JobsDashboardVersionResolver = Class.create();
JobsDashboardVersionResolver.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getVersion: function() {
        var gr = new GlideRecordSecure("sys_store_app");
        gr.get("scope", "sn_async_dashboard");
        if (gr.getValue("version").indexOf("1") == 0)
            return 1;
        else
            return 2;
    },

    type: 'JobsDashboardVersionResolver'
});
