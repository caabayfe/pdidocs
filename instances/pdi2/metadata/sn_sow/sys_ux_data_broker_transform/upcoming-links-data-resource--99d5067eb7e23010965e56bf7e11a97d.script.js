function transform(input) {
    var request = input.request;
    if (gs.nil(request)) {
        throw gs.getMessage("Request not passed in");
    }
	request = 'string' == typeof request ? JSON.parse(request) : request;
	var data = new sn_sow.SOWUpcomingLinksService().process(request);
    return data;
}
