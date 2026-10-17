function transform(input){
	var vscGetDatesObj = new sn_vsc.VscGetHardeningComparisonDatesForUser();
	return vscGetDatesObj.getDatesForUser(input.user_name);
}
