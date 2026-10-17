answer = current.insert();
action.setRedirectURL(current);
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
