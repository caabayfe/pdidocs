answer = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
action.setRedirectURL('ws_blank_page.do');
