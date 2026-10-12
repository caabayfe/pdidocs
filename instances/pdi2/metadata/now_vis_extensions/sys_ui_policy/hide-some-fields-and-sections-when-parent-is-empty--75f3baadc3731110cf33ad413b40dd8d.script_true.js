function onCondition() {
  try{
     //Hide all form sections
     var sections = g_form.getSections();
     sections[1].style.display = 'none';
	 sections[2].style.display = 'none';
    }catch(e){}

}
