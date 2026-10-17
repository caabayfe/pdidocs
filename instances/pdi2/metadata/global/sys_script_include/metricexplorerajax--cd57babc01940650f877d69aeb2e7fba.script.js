var MetricExplorerAjax = Class.create();
MetricExplorerAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /** 
     * Create and get the params for metric explorer url
     */
    getUrlParameters: function() {
        var ciSysId = this.getParameter("sysparm_ciSysId");
        var params = {};

        var cmdbCiGr = new GlideRecordSecure("cmdb_ci");
        if (cmdbCiGr.get(ciSysId))
            params["ciType"] = cmdbCiGr.getValue("sys_class_name");

        var currentTime = new GlideDateTime();

        // By default we would show data in range if 2 hours (Time before 2 hrs - current time)
        var endTime = currentTime.getNumericValue(); // current epoch time
        params["endTime"] = endTime;
        currentTime.addSeconds(-7200);
        var startTime = currentTime.getNumericValue();
        params["startTime"] = startTime;

        return JSON.stringify(params);
    },

    type: 'MetricExplorerAjax'
});
