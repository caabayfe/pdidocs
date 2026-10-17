(function (finding, current) {
	var minDefault = '5'; // as per documentation
	var sysMin = parseInt(gs.getProperty('glide.edge.pattern.min.size', minDefault));
	if (current.sample.toString().length < sysMin) {
		// found pattern with less than current set property value
		finding.setCurrentSource(current);
		finding.increment();
	}

})(finding, current);
