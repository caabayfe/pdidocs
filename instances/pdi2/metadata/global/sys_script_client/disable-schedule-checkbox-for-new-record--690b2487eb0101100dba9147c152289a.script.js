function onLoad() {
    if(g_form.isNewRecord()){
      g_form.setDisplay('schedule', false);
   }
   else{
      g_form.setDisplay('schedule', true);
   }
}
