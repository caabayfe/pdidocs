answer = checkUser();

function checkUser(){
	var user = gs.getUserID();
	var currUser = current.getValue('user');
	if(user == currUser) return true;
	return false;
}
