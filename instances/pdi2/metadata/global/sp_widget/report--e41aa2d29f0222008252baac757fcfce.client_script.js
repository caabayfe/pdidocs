function($timeout) {

  var c = this;
	var reportId = c.options.report_id || '';
	c.rectangleId = c.widget.rectangle_id || c.data.rectangleId;

	c.showTitle = (c.options.show_title === true || c.options.show_title === 'true');
	c.title = c.options.title || '';

	if (c.options.widget_parameters){
		c.initialMessage = c.data.ch.i18n.building;
		window.chartHelpers = window.chartHelpers || {};
		$.extend(window.chartHelpers, c.data.ch);
		$timeout(function(){
			var targetEl = $("#report-widget-"+c.rectangleId);
			embedReportById(targetEl, reportId);
		});
	}
	else {
		c.initialMessage = c.data.ch.i18n.selectReport;
	}

}
