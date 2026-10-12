(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var month =  new BenchmarkUtil().getMonthDisplay(current.start_date).display;
	template.print(month);
})(current, template, email, email_action, event);
