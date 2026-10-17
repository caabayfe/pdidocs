(function executeRule(current, previous /*null when async*/) {

	var count = parseInt(current.count) || 0;
	if(count > 0) {
		var durationNumber = parseInt(current.duration) || 0;
		if(durationNumber > 0) {
			current.average =  (durationNumber/count).toFixed(3);
			var seconds = durationNumber/1000;
			if(seconds > 0)
				current.count_per_second = (count/seconds).toFixed(1);
		}
	}

})(current, previous);
