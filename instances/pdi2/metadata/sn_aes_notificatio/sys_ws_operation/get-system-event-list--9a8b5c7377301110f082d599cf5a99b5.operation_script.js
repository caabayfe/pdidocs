(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        const events = [];
        const eventNameLookup = {};
        let currentEventName = "";
        const gr = new GlideRecord("sysevent_register");

        gr.orderBy("event_name");
        gr.query();

        while (gr.next()) {
            currentEventName = gr.getValue("event_name");

            if (!eventNameLookup[currentEventName]) {
                eventNameLookup[currentEventName] = true;
                events.push({
                    "event_name": gr.getValue("event_name")
                });
            }
        }

        response.setStatus(200);
        response.setBody(events);

    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [exception]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [exception]));
    }

})(request, response);
