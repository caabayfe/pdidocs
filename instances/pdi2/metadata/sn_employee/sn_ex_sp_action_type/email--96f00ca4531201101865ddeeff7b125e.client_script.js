if(email== "null")
{
	spUtil.addErrorMessage("Email address is not set for this user.");
}
else{
	$window.location.href = "mailto:"+email;
}
