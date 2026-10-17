var CheckServiceClass = Class.create();
CheckServiceClass.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    type: 'CheckServiceClass',
    ajaxFunction_checkServiceClass: function() {
        var counter = 0;
        var selectedId = this.getParameter('sysparm_selected_id');
        var tableName = this.getParameter('sysparm_table_label');
        var serviceClassName = this.getParameter('sysparm_service_class_name');
        var gr = new GlideRecord(tableName);
        gr.addQuery("sys_id", "IN", selectedId);
        gr.query();
        while (gr.next()) {
            var grServiceClassName = gr.getValue("service_classification");
            if ((grServiceClassName != null) && (grServiceClassName != serviceClassName)) {
                counter++;
            }
        }
        return counter ? counter : true;
    },
});
