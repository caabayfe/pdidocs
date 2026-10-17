(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var shifts = request.body.data.shifts;
	if (!shifts)
        return new sn_ws_err.BadRequestError("Shifts are not provided");

	if (shifts.length) {
		for (var i = 0; i < shifts.length; i++) {
			var shift = shifts[i];
			if (shift.sys_id) {
				var rotaGr = new GlideRecord("cmn_rota");
				if(rotaGr.get(shift.sys_id)) {
					if (rotaGr.canWrite()) {
						if (shift.state === 'draft') {
							rotaGr.setValue('state', 'draft');
							rotaGr.setValue('active', false);
						} else if (shift.state === '') {
							rotaGr.setValue('state', '');
							rotaGr.setValue('active', true);
							
						}
						if (rotaGr.update()) {
							shift.status = "successfully_udpated";
							if (shift.state === '' && shift.send_subscriptions)
								new OCRotaICalendar().sendCalendarURL(rotaGr);
						}
					} else
						shift.status = "security_constraint";
				} else {
					shift.status = "invalid_sys_id";
				}
			}
		}
	}

    return shifts;

})(request, response);
