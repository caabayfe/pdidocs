function onCondition() {
  try{
     //Show the JSON key form section
     var sections = g_form.getSections();
     sections[2].style.display = 'block';
  }catch(e){}

}
