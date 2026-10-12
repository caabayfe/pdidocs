function transform(input) {
	//Get most affected securityArea and most affected Priority
	var result = [];
	var obj = new sn_vsc.SCComparisonUtil();
	var securityArea = obj.mostRepeatedSecurityArea();
	var priority = obj.getAllPriorityForSecurityArea(securityArea);
	result.push({
		"securityArea": securityArea,
		"priority": priority
	});
	return result;
}
