action.setRedirectURL(current);
var sr = new ScopeRegister();
var registered = sr.registerScope(current.scope.toString());
current.setAbortAction(!registered);
if(registered)
	answer = current.insert();
else
	gs.addErrorMessage(sr.getLastErrorMessage());
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
