function transform(input) {
    var result = {};
    var updatePayload = input.payload;
    try {
		var gt = new GlideTime();
		return { timezone: gs.getSession().getTimeZoneName(), offset: gt.getTZOffset() };
    } catch (e) {
        gs.info("Error while getting timezone offset " + e.message);
        result = {
            status: 500,
            error: e.message
        };
    }
}
