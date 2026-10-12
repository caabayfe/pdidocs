if(phno == 'null'){
	spUtil.addErrorMessage("Work phone is not set for this user");
}
else{
	$window.location.href = "tel:" + phno;
}
