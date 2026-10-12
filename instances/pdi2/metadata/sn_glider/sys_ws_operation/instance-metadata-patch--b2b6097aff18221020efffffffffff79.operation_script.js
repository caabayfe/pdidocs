(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const body = request.body.data;
	const instanceMetaStr = gs.getUser().getPreference('nowsdk.instance_metadata') || '{}';
	const instanceMeta = JSON.parse(instanceMetaStr);
	const newInstanceMeta = {
		...instanceMeta,
		...body
	};
	gs.getUser().savePreference('nowsdk.instance_metadata', JSON.stringify(newInstanceMeta));
	response.setStatus(200);
})(request, response);
