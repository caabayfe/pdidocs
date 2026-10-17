function onLoad() {
  //Type appropriate comment here, and begin script below
  if (g_form.isNewRecord()) {
       var strategy = g_form.getValue('strategy');
       var goalFrameworkAjax = new GlideAjax('sn_gf.GoalFrameworkAjaxProcessor');
       goalFrameworkAjax.addParam('sysparm_name', 'getDefaultGoalDatesFromStrategy');
       goalFrameworkAjax.addParam('sysparm_strategy', strategy);
   
       goalFrameworkAjax.getXML(function(response) {
           var answer = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
           if(answer){
       if (answer['start_date'])
         g_form.setValue('start_date', answer['start_date']);
       if (answer['end_date'])
         g_form.setValue('end_date', answer['end_date']);
     }
       });
   }
}
