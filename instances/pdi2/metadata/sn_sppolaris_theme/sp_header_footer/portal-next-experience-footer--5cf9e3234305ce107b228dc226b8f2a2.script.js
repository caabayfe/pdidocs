(function() {
	data.footer = {};
	var details = {};
	var quick_start_config = $sp.getValue("quick_start_config");
	if (quick_start_config) {
		try{
			var config = JSON.parse(quick_start_config)[0];
			var footerConfig = config.footer ? config.footer : {};
			if(Object.keys(footerConfig).length){
				var localizedOrgInfo = [],
						len = footerConfig.org_info ? footerConfig.org_info.length : 0;
				details.logo = {};
				details.logo.imageUrl = footerConfig.logo_img_name;
				details.logo.altText = footerConfig.logo_alt_text && footerConfig.logo_img_name ? gs.getMessage(footerConfig.logo_alt_text): "";
				for (var i = 0; i < len; i++)
					localizedOrgInfo[i] = gs.getMessage(footerConfig.org_info[i]);
				details.logo.content = len > 0 ? localizedOrgInfo : '';
				details.copyright = footerConfig.copyright ? gs.getMessage(footerConfig.copyright): "";
				details.menus = {};
				details.menus.bottom_links = [];
				var sys_id = '',
						menuItems = {};
				// Bottom Links
				sys_id = footerConfig.footer_links_menu_sys_id;
				menuItems = $sp.getMenuItems(sys_id);
				details.menus.bottom_links = menuItems;
				// Navigation Links
				details.menus.navigation_links = [];
				sys_id = footerConfig.sitemap_links_menu_sys_id;
				menuItems = $sp.getMenuItems(sys_id);
				details.menus.navigation_links = menuItems;
				// Social Icons
				details.menus.social_icons = [];
				sys_id = footerConfig.social_links_menu_sys_id;
				menuItems = $sp.getMenuItems(sys_id);
				details.menus.social_icons = menuItems;
				if(footerConfig.social_icons_color)
				details.menus.social_icons_color = footerConfig.social_icons_color;
			}
		}catch(e){
			gs.addErrorMessage(gs.getMessage("The Quick start configuration contains an invalid configuration for the footer"));
		}
	}
	data.footer = details;
})();
