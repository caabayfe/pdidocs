(function executeRule(current, previous /*null when async*/) {

	var minPartitionSize = parseInt(gs.getProperty('com.glide.min_partition_size', 1000));
	var currentPartitionSize = parseInt(current.partition_size);
	
	if(currentPartitionSize < minPartitionSize) {
		gs.addErrorMessage("Incorrect custom partition size, please enter a number greater than or equal to " + minPartitionSize);
		current.setAbortAction(true);
	}

})(current, previous);
