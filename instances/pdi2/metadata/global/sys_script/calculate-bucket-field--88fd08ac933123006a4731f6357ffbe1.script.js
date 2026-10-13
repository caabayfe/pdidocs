(function executeRule(current, previous /*null when async*/) {
	var bucketCalculator = new EmBucketCalculator();
    current.bucket = bucketCalculator.calculateBucket(current);		
})(current, previous);
