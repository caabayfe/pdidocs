(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
		
		const notificationUtil = sn_nowassist_diagn.MonitoringNotificationUtil;
		template.print(notificationUtil.localize(notificationUtil.URL_MESSAGE, current.getValue('recipient'), [current.getValue('matched_records')]));

})(current, template, email, email_action, event);
