answer = current.insert();
if (current.drop_off == true) {
   action.setRedirectURL(current);
} else {
   gs.include('ActionUtils');
   var au = new ActionUtils();
   au.postInsert(current);
}
