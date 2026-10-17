(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var viewRecommendationsLink = global.AutoResolutionUtil.getViewRecommendationsLink(current.sys_class_name, current.sys_id);
    template.print(viewRecommendationsLink + '&amp;action=iar_optout');
	
})(current, template, email, email_action, event);
