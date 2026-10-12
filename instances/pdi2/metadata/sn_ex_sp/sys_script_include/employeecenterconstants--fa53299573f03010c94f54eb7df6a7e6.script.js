var EmployeeCenterConstants = Class.create();
EmployeeCenterConstants.prototype = {
    initialize: function() {
    },
    type: 'EmployeeCenterConstants'
};
EmployeeCenterConstants.PLUGINS = {
	ECBE: 'com.snc.ex_browser_extension'
};

EmployeeCenterConstants.WIDGET = {};
EmployeeCenterConstants.TABLE = {};
EmployeeCenterConstants.TABLE.FOOTER =  {
	NAME: 'sn_ex_sp_footer',
	FIELDS: {
		NAME: 'name',
		PORTAL: 'portal',
		LOGO: 'logo',
		ORGANIZATION_CONTENT: 'organization_content',
		COPYRIGHT: 'copyright'
	}
};
EmployeeCenterConstants.TABLE.FOOTER_MENU = {
	NAME: 'sn_ex_sp_footer_menu',
	FIELDS: {
		FOOTER: 'footer',
		MENU: 'menu',
		ORDER: 'order',
		LINK_TYPE: 'link_type'
	},
	TYPES: {
		NAVIGATION_LINKS: 'navigation_links',
		BOTTOM_LINKS: 'bottom_links',
		SOCIAL_ICONS: 'social_icons'
	}
};
EmployeeCenterConstants.TABLE.SP_INSTANCE_MENU = {
	NAME: 'sp_instance_menu',
	FIELDS: {
		TITLE: 'title'
	}
};
EmployeeCenterConstants.WIDGET.HELP_CENTER_TOPICS = {
  CONTENT_TYPE_ICONS: {
    'kb_knowledge': 'fa-file-text-o',
    'sc_cat_item': 'fa-pencil-square-o',
    'sn_ex_sp_quick_link': 'fa-link',
    DEFAULT: 'fa-file-text-o'
  }
};
