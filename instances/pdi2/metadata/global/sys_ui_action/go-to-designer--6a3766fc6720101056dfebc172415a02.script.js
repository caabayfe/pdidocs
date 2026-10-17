action.setRedirectURL(current);
current.update();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postUpdate(current);
