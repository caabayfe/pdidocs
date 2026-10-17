(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
		
	template.print(global.AutoResolutionUtil.getViewRecommendationsLink(current.sys_class_name, current.sys_id));

})(current, template, email, email_action, event);
