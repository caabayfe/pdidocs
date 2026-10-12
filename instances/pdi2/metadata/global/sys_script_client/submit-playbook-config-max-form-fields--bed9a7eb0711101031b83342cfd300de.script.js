function onSubmit() {
   if(g_form.getIntValue('max_form_fields_on_card') < 0){
      g_form.showFieldMsg("max_form_fields_on_card", getMessage("Max form fields on card cannot have a negative value"), "error");
      return false;
   }
      
}
