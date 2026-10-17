var UXBannerAnnouncementGetFields = Class.create();
UXBannerAnnouncementGetFields.prototype = {
    initialize: function() {},
	getFields: function(param) {
		return ({
			"heading": param.getValue('heading'),
			"summary": param.getValue('summary'),
			"start": param.getValue('start'),
			"end": param.getValue('end'),
			"add_link": param.getValue('add_link'),
			"link_label": param.getValue('link_label'),
			"link_url": param.getValue('link_url'),
			"link_click_behavior": param.getValue('link_click_behavior'),
			"icon": param.getValue('icon'),
			"icon_tooltip": param.getValue('icon_tooltip'),
			"color": param.getValue('color'),
			"order": param.getValue('order'),
			"experience": param.getValue('experience'),
			"show_for": param.getValue('show_for'),
			"roles": param.getValue('roles'),
			"group": param.getValue('group'),
			"contentPosition": param.getValue('content_position'),
			"sysId": param.sys_id,
			"nonDismissible": param.non_dismissible,
			"nonStackable": param.non_stackable
		});
	},
	getReferences: function (param) {
		return ({
			"heading": param.heading,
			"summary": param.summary,
			"start": param.start,
			"end": param.end,
			"add_link": param.add_link,
			"link_label": param.link_label,
			"link_url": param.link_url,
			"link_click_behavior": param.link_click_behavior,
			"icon": param.icon,
			"icon_tooltip": param.icon_tooltip,
			"color": param.color,
			"order": param.order,
			"experience": param.experience,
			"show_for": param.show_for,
			"roles": param.roles,
			"group": param.group,
			"sysId": param.sys_id,
			"contentPosition": param.content_position,
			"nonDismissible": param.non_dismissible,
			"nonStackable": param.non_stackable
		});
	},
    type: 'UXBannerAnnouncementGetFields'
};
