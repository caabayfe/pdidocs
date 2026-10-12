function transform(input) {

    var payload = input.payload;
    for (var key in payload) {
        if (payload.hasOwnProperty(key)) {
            var gr = new GlideRecord("pa_indicators");
            gr.get(key);
            if (payload[key].description != undefined)
                gr.description = payload[key].description;
            if (payload[key].condition != undefined)
                gr.conditions = payload[key].condition;
            gr.update();
        }
    }

}
