// browser supports angular
var isBrowserSupported = GlideVTBCompatibility.getCompatibility();

if (isBrowserSupported == "allow")
	g_scratchpad.browserSupported = true;
else
	g_scratchpad.browserSupported = false;

// UI doctype
g_scratchpad.isNewUI = gs.getProperty('glide.ui.doctype', 'false') == 'true';
