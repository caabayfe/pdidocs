function hasClass(ctrl, className) {
	return (ctrl.className.split(" ").indexOf(className) >= 0);
}

function findParent(ctrl, className) {
	while (ctrl.parentNode) {
		if (hasClass(ctrl.parentNode, className))
			return ctrl.parentNode;
		ctrl = ctrl.parentNode;
	}
	return null;
}

function onSubmit() {
   	var fields = ['breakdown_level2', 'column_steps' ,'element' ,'followed_breakdown_relation' ,'scorecard_options' ,'compare_main_label' ,'percentages' ,'yaxis_title' ,'flip_axes' ,'include_comments' ,'gauge_to' ,'date_from' , 'include_trend' ,'breakdown_page_size' ,'manual_elements' ,'yaxis_to' ,'include_target' ,'indicator' ,'sort_on' ,'elements_filter' ,'date_to', 'follow_managed_element' ,'sort_direction' , 'yaxis2_title', 'period' ,'gauge_from' , 'show_data_labels' ,'is_compare_chart' ,'type' ,'include_confidence' ,'color_scheme', 'show_top_x' ,'default_indicator' ,'template','pivot_elements_filter' , 'pivot_breakdown', 'filter' ,'breakdown' ,'lastscore_periods_back' ,'yaxis_from' ,'number_of_records' ,'column_stepsize' ,'yaxis2_to' ,'show_range_selector' ,'lastscore_compare' ,'visualization' ,'follow_element' ,'yaxis2_from' ,'include_thresholds' ,'followed_breakdown' ,'chart_color' ,'aggregate'  ,'compare_period' , 'compare_number_of_periods' ,'show_bar' ,'include_forecast' ,'tag' ,'element_level2' ,'max_color' ,'show_total' ,'gauge_autoscale'];
	
	for (var idx = 0; idx < fields.size(); idx++) {
		var ctrl = gel("element.pa_widgets." + fields[idx]); 
		if (ctrl != null) {
			var parent = findParent(ctrl, 'tabs2_section');
			var visible = ctrl.style.display != 'none' && (!parent || parent.children[0].style.display != 'none');
			if (!visible) {
				var value = g_form.getValue(fields[idx]);
				//console.log(fields[idx] + ': ' + value);
				if (value && value != "")
					g_form.clearValue(fields[idx]);
					
			}
			
		}
	}
}
