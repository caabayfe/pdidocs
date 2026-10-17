var determineType = function(x) {
	var type;
	if(x == "7b80ed7753823010ee0dddeeff7b1223") { //attestation policy type sys id
		type = 2;
	} else if(x == "fe2a16b3436031106d8a8ef0dab8f2ff") { //certification policy type sys id
		type = 4;
	} else {
		type = 3;
	}
	return type;
};

determineType(current.policy_id.cmdb_policy_type);
