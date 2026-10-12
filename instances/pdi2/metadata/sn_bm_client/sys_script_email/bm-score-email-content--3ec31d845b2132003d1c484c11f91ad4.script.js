(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

          // Add your code here
	var msg = (new GlidePluginManager().isActive('com.glide.service-portal')) ?
		gs.getMessage('You can see the updated Benchmarks by visiting <a title="Benchmarks Dashboard" href="/now/success-dashboard/benchmarks">Benchmarks Dashboard</a>.')
	  : gs.getMessage("Benchmarks visualizations depends on the Service Portal plugin, please activate it to view the dashboard")

  template.print(msg);

})(current, template, email, email_action, event);
