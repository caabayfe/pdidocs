(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
	/* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
	/* Optional GlideRecord */ event) {

	var width = 'width: 100%;';
	var fontSize = 'font-size: 16px;';
	var lineHeight = 'line-height: 24px;';
	var paddingTop = 'padding-top: 16px;';
	var marginBottom = 'margin-bottom: 16px;';
	var notificationUtil = new RequestNotificationUtil();
	var comment = notificationUtil.getComments(current.sys_id, 'sc_req_item');
	var salutation = notificationUtil.setGreetingsMessage(current, email_action);
	var portalSuffix = new sn_ex_emp_fd.FoundationNotificationUtil().getPortalSuffix();
	var uri = gs.getProperty('glide.servlet.uri') + portalSuffix +'?id=ticket&table=' + current.sys_class_name + '&sys_id=' + current.sys_id;
	var catalogItemJS = new sn_sc.CatItem(current.cat_item);
	var catItemDetails = catalogItemJS.getItemSummary(true);
	var desc = catItemDetails.name.toString();

	template.print('<div style="font-size: 24px; line-height: 36px; text-align: center; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid #DADDE2;">' + comment.user + ' added a comment to your request</div>');
	template.print('<div style="' + width + fontSize + lineHeight + '">'+ salutation + '</div>');
	template.print('<div style="' + width + fontSize + lineHeight + paddingTop + '">' + comment.user + ' left a comment on <span style="font-weight: 600;">' + current.number + ':</span></div>');
	template.print('<div style="' + width + fontSize + lineHeight + paddingTop + marginBottom + '"><span style="font-weight: 600;">' + comment.val + '</span></div>');
	notificationUtil.createNotificationPrimayAction(template, uri, 'View comments');
	template.print('<div style="font-size: 20px; line-height: 30px; font-weight: 600; margin-bottom: 16px;">About this request</div>');
	template.print('<div style="' + fontSize + lineHeight + '"><span>Request number: </span><span style="font-weight: 600;">' + current.number + '</span></div>');
	template.print('<div style="' + fontSize + lineHeight + ' margin-bottom: 16px;"><span>Short description: </span><span style="font-weight: 600;">' + desc + '</span></div>');

})(current, template, email, email_action, event);
