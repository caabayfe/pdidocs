(function requestBucketProvider(dataRequests) {
	return JSON.parse(dataRequests).map(req => {
		return [
			req.requestId
		];
	});
})(dataRequests);
