function onCondition() {
  try{
     //show all form sections
     var sections = g_form.getSections();
     sections[1].style.display = 'block';
	 sections[2].style.display = 'block';
    }catch(e){}
    
}
