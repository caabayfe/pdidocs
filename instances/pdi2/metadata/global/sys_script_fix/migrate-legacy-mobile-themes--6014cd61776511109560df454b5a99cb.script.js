function migrateLegacyThemes() {
	gs.info('Migration of legacy mobile themes has started');
	var nativeClientGr = new GlideRecord("sys_sg_native_client");
	nativeClientGr.query();
	var uxThemeSysId;
	var createdThemeRecords = {};
	
	while (nativeClientGr.next()) {
		// Check if migration needed for `client_theme` and `navigation`
		if (gs.nil(nativeClientGr.mobile_theme) && shouldMigrate(nativeClientGr.client_theme, nativeClientGr.navigation)) {
			var key = nativeClientGr.client_theme.sys_id + nativeClientGr.navigation.sys_id;
			if (key in createdThemeRecords) {
				uxThemeSysId = createdThemeRecords[key];
			} else {
				uxThemeSysId = createThemeRecords(nativeClientGr.client_theme, nativeClientGr.navigation);
				createdThemeRecords[key] = uxThemeSysId;
			}
			linkThemeRecordToNativeClient(uxThemeSysId, nativeClientGr);
		}
	}
	gs.info("Migration of legacy mobile themes has ended");
}

function getOOTBRecords() {
	var ootbRecords = {
		"Brand": "#293e40",
		"Primary": "#1f8476",
		"Secondary": "#165c53",
		"Destructive": "#c83c36"
	};
	return ootbRecords;
}

function shouldMigrate(client_theme, navigation) {
	return shouldMigrateLegacyTheme(client_theme) || shouldMigrateNavigationTheme(navigation);
}

function linkThemeRecordToNativeClient(uxThemeSysId, nativeClientGr) {
	// Associating this theme record to the native client
	if (!gs.nil(uxThemeSysId)) {
		nativeClientGr.setValue('mobile_theme', uxThemeSysId);	
		nativeClientGr.update();
	}
}

function shouldMigrateLegacyTheme(client_theme) {
	
	if (gs.nil(client_theme))
		return false;
	
	var legacyThemeColors = client_theme.palette;
	var ootbRecords = getOOTBRecords();
	
	// compare for any change in colors
	for (colorNameKey in legacyThemeColors) {
		var clientCustomColor = legacyThemeColors[colorNameKey];
		var nativeColor = ootbRecords[colorNameKey];
		if (isValidHexColor(clientCustomColor) && isValidColorName(colorNameKey) && clientCustomColor !== nativeColor) {
			return true;
		}
	}
	return false;
}

function shouldMigrateNavigationTheme(navigation) {
	if (gs.nil(navigation))
		return false;
	
	var legacyColor = navigation.color;
	var legacyQuickActionsMenuColor = navigation.quick_actions_menu_color;
	return (!gs.nil(legacyColor) && isValidHexColor(legacyColor)) || (!gs.nil(legacyQuickActionsMenuColor) && isValidHexColor(legacyQuickActionsMenuColor));
}

function isValidColorName(colorName) {
	var ootbColorNames = ["Brand", "Secondary", "Primary", "Tertiary", "Positive", "Destructive"];
	return ootbColorNames.indexOf(colorName) !== -1;
}

function createThemeRecords(client_theme, navigation) {
	
	var styleThemePrefix = "Upgraded Mobile";
	var styleSuffix = "Colors";
	var themeSuffix = "Theme";
	var legacyThemeName;
	var legacyStyleName;
	var colorMap;
	
	if (shouldMigrateLegacyTheme(client_theme)) {
		legacyThemeName = styleThemePrefix + " " + client_theme.name + " " + themeSuffix;
		legacyStyleName = styleThemePrefix + " " + client_theme.name + " " + styleSuffix;
		
		colorMap = transformClientCustomTheme(client_theme.palette);
		
		// sets the new swipe action mobile variable colors on migration
		setSwipeActionVarColors(colorMap);
	}
	if (shouldMigrateNavigationTheme(navigation)) {
		
		var navColors = transformNavigationTheme(navigation);
		if (gs.nil(legacyThemeName)) {
			legacyThemeName = styleThemePrefix + " " + themeSuffix;
			legacyStyleName = styleThemePrefix + " " + styleSuffix;
			colorMap = navColors;
		} else {
			// merging the objects `colorMap` and `navColors` into `colorMap`
			for (navColorKey in navColors) {
				colorMap[navColorKey] = navColors[navColorKey];
			}
		}
	}
	
	convertHexToRGB(colorMap);
	var transformedColorMap = {
		"nativeMobile": colorMap
	};
	return createRecords(legacyThemeName, legacyStyleName, transformedColorMap);
}

function transformClientCustomTheme(palette) {
	var ootbRecords = getOOTBRecords();
	var colorMap = {};
	for (colorKey in palette) {
		if (isValidColorName(colorKey)) {
			if (!gs.nil(palette[colorKey]) && isValidHexColor(palette[colorKey]))
				colorMap[colorKey] = palette[colorKey];
			else if (!gs.nil(ootbRecords[colorKey]))
				colorMap[colorKey] = ootbRecords[colorKey];
		}
	}
	return colorMap;
}

function transformNavigationTheme(navigation) {
	var navColors = {};
	var legacyColor = navigation.color;
	var legacyQuickActionsMenuColor = navigation.quick_actions_menu_color;
	
	if (!gs.nil(legacyColor) && isValidHexColor(legacyColor))
		navColors['Navigation Bar Selected'] = navigation.color;
	
	if (!gs.nil(legacyQuickActionsMenuColor) && isValidHexColor(legacyQuickActionsMenuColor))
		navColors['Quick Action Background'] = navigation.quick_actions_menu_color;
	return navColors;
}

function setSwipeActionVarColors(colorMap) {
	var swipeActionSuffix = "Swipe Action";
	var swipeActionColorKey;
	for (colorMapKey in colorMap) {
		if (isValidSwipeActionColorName(colorMapKey)) {
			swipeActionColorKey = colorMapKey + " " + swipeActionSuffix;
			colorMap[swipeActionColorKey] = colorMap[colorMapKey];
		}
	}
}

function isValidSwipeActionColorName(colorName) {
	var swipeActionColorNames = ["Primary", "Secondary", "Tertiary", "Positive", "Destructive"];
	return swipeActionColorNames.indexOf(colorName) !== -1;
}

function createRecords(customThemeName, customStyleName, transformedLegacyThemeColors) {
	var uxStyleGr = createUXStyleRecord(customStyleName, transformedLegacyThemeColors);
	var uxThemeGr = createUXThemeRecord(customThemeName);
	createM2MRecords(uxStyleGr, uxThemeGr);
	return uxThemeGr.getValue('sys_id');
}

function createUXStyleRecord(customStyleName, transformedLegacyThemeColors) {
	var uxStyleGr = new GlideRecord("sys_ux_style");
	uxStyleGr.initialize();
	uxStyleGr.setValue('name', customStyleName);
	uxStyleGr.setValue('style', JSON.stringify(transformedLegacyThemeColors));
	uxStyleGr.setValue('type', 'core');
	uxStyleGr.insert();
	return uxStyleGr;
}

function createUXThemeRecord(customThemeName) {
	var uxThemeGr = new GlideRecord("sys_ux_theme");
	uxThemeGr.initialize();
	uxThemeGr.setValue('name', customThemeName);
	uxThemeGr.setValue('active', 'true');
	uxThemeGr.insert();
	return uxThemeGr;
}

function createM2MRecords(uxStyleGr, uxThemeGr) {
	var m2mThemeGr = new GlideRecord('m2m_theme_style');
	m2mThemeGr.initialize();
	m2mThemeGr.setValue('style', uxStyleGr.getValue('sys_id'));
	m2mThemeGr.setValue('order', 100);
	m2mThemeGr.setValue('theme', uxThemeGr.getValue('sys_id'));
	m2mThemeGr.insert();
	
	// Associating the Legacy Mobile Style to the Upgraded Mobile Legacy theme record
	// Using `sys_id` of `Mobile Colors Legacy` style record
	m2mThemeGr = new GlideRecord('m2m_theme_style');
	m2mThemeGr.initialize();
	m2mThemeGr.setValue('style', '4ed92c375b411110848b28582d81c7d2');
	m2mThemeGr.setValue('order', 0);
	m2mThemeGr.setValue('theme', uxThemeGr.getValue('sys_id'));
	m2mThemeGr.insert();
}

function convertHexToRGB(legacyThemeColors) {
	for (colorName in legacyThemeColors) {
		var rgbColor = hexToRGB(legacyThemeColors[colorName]);
		legacyThemeColors[colorName] = rgbColor;
	}
}

function hexToRGB(hexColor) {
	var regExp = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
	var rgbArray = regExp.exec(hexColor);
	var rgb = "";
	if (!gs.nil(rgbArray)) {
		rgb = [parseInt(rgbArray[1], 16), parseInt(rgbArray[2], 16), parseInt(rgbArray[3], 16)].join(',');
	}
	return rgb ? rgb : null;
}

function isValidHexColor(hexColor) {
	var regExp = /^#[0-9A-F]{6}$/i;
	return regExp.test(hexColor);
}

migrateLegacyThemes();
