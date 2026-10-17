var MetricsExplorerUtils = Class.create();
MetricsExplorerUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getClassList: function() {
		var CI_CLASS = "cmdb_ci.sys_class_name";
		var M2CI = "sa_metric_map";

        var classes = [];

        var ga = new GlideAggregate(M2CI);
        ga.addActiveQuery();
        ga.addNotNullQuery("cmdb_ci");
        ga.groupBy(CI_CLASS);
        ga.query();

        while (ga.next()) {
			var class_name = ga.getValue(CI_CLASS);
            if (!JSUtil.nil(class_name)){
                classes.push(class_name);
            }
        }

        return classes.toString();
    },
    type: 'MetricsExplorerUtils'
});
