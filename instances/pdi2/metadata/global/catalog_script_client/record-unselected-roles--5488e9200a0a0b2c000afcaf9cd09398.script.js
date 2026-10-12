function onSubmit() {
   var unselected = new Array();
   var options = gel("delegate_roles_roles_select_0").options;
   for (var i = 0; i < options.length; i++)
      unselected.push(options[i].value);
   g_form.setValue("delegate_roles_not_selected", unselected.join());

}
