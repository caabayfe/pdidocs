function transform(input) {
    var result = {};
    var gr = new GlideRecord('sn_um_lastclone_summary');
    gr.query();

    if (gr.next()) {
		var gdtStart = new GlideDateTime(gr.start_time);
        result.startTime = gdtStart.getDisplayValue();
		
        var gdtEnd = new GlideDateTime(gr.end_time);
        result.endTime = gdtEnd.getDisplayValue();
		result.state = gr.getDisplayValue('state');
    }
    return result;
}
