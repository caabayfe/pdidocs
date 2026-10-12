function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
      return;
    }

    var ga = new GlideAjax('CMDBWsAjaxUtil'); //Call script include
    ga.addParam('sysparm_name', 'getClassDisplayName'); //Method
    ga.addParam('sysparm_datacenter_class', g_form.getValue('datacenter_class')); //Parameters
    ga.getXMLAnswer(getResponse);

    function getResponse(response){
      var res = JSON.parse(response);
      if (res.className) {
        var formattedClassName = res.className.replace(" Datacenter", "");
        g_form.setValue('cloud_provider',formattedClassName);
      }
    }
   
}
