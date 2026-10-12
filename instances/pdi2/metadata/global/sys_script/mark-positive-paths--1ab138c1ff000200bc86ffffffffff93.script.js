setPostiveness();

function setPostiveness() {
	var POSITIVES = ['approved', 'yes', 'ok', 'complete', 'completed', 'always'];
	
	current.is_positive = isPositive(current);
	
	function isPositive(condition) {
		 return new ArrayUtil().contains(POSITIVES, condition.name.toLowerCase());
	}	

}
