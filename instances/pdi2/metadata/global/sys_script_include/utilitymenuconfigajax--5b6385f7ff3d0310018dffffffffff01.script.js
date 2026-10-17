var UtilityMenuConfigAjax = Class.create();
UtilityMenuConfigAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    getWidgetDetails: function() {
        var widgetSysId = this.getParameter('sysparm_widget_sys_id');
        
        if (!widgetSysId) {
            return '{"id":"","name":""}';
        }
        
        var gr = new GlideRecord('sys_ux_widget');
        if (gr.get(widgetSysId)) {
            var widgetId = gr.id.toString();
            var widgetName = gr.name.toString();
            
            return '{"id":"' + widgetId + '","name":"' + widgetName + '"}';
        }
        
        return '{"id":"","name":""}';
    },
    
    type: 'UtilityMenuConfigAjax'
});
