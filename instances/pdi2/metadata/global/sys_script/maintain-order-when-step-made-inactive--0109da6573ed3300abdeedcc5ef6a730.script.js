(function executeRule(current, previous /*null when async*/ ) {
	
	var gr, gr1;
	var stepType = current.step_type.toString();
	
	if (stepType === 'step' || stepType === '') {
        if (current.active == false && current.order == -1) {
            gr = new GlideRecord('sys_embedded_tour_step');
            gr.addQuery('guide', current.guide);
            gr.addQuery('active', true);
            gr1 = gr.addQuery('step_type', 'step');
            gr1.addOrCondition('step_type', '');
            gr.orderBy('order');
            gr.query();
            var i = 1;
            while (gr.next()) {
                gr.order = i;
                gr.update();
                i++;
            }
        }
    }

})(current, previous);
