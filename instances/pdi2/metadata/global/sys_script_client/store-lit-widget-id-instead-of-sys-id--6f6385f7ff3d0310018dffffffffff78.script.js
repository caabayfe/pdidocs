function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    console.log('onChange triggered - newValue: ' + newValue + ', isLoading: ' + isLoading);
    
    if (isLoading || newValue === '' || newValue === oldValue) {
        return;
    }
    
    console.log('Calling GlideAjax with sys_id: ' + newValue);
    
    var ga = new GlideAjax('UtilityMenuConfigAjax');
    ga.addParam('sysparm_name', 'getWidgetDetails');
    ga.addParam('sysparm_widget_sys_id', newValue);
    ga.getXMLAnswer(function(answer) {
        console.log('GlideAjax response: ' + answer);
        
        if (answer) {
            var details = JSON.parse(answer);
            if (details.id) {
                g_form.setValue('custom_element_name', details.id);
                console.log('Set custom_element_name to: ' + details.id);
            }
        }
    });
}
