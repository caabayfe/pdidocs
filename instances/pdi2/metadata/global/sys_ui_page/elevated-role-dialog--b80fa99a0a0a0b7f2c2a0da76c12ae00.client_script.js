checkExpiredRole();

function checkExpiredRole() {
	var gdw = GlideDialogWindow.get();
	var param = gdw.getPreference("activeElevatedRoles");
	if (param == undefined)
		return;
	
	gel('new_elevated_role').style.display = 'none';
	gel('expired_role').innerHTML = '&nbsp;' + param;
	gel('expired_elevated_role').style.display = 'inline';
}

function elRoleOk() {
	var inputs = $(document.body).select(".role_input");
	var s = "";
	
	for(i = 0; i < inputs.length; i++) {
		var el = inputs[i];
		if (el.checked == true) {
			s += el.value + ",";
		}
	}
	
	s = s.substring(0, s.lastIndexOf(","));
	var el = gel("elevated_roles");
	el.value = s;
	
	// Set the redirect url
	try{
		var gmu = gel('gsft_main_url');
		var main_url = window.frames.gsft_main.location.toString();
		gmu.value = encodeURIComponent(main_url);
	} catch(err){
	}
	
	return true;
}
