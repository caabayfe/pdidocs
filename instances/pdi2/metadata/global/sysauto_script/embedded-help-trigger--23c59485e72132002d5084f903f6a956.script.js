// the code below tries to download the content again if for any reason the legacy help failed to download on system.upgrade.

var buildInitial = gs.getProperty("glide.buildname").substring(0,1).toLowerCase();
// This would be null on zboot, because this property is being set whenever a successful download goes through.
var lastDownloadedContent = gs.getProperty("com.glide.embedded_help.last_downloaded_content_family");

if (!lastDownloadedContent || lastDownloadedContent != buildInitial) {
	new SNC.EmbeddedHelpContentDownloader().downloadContents(buildInitial);
} 
else {
    var triggerSync = true;
    if (gs.getProperty("com.glide.embedded_help.download_non_english_content", "false") === "true") {
        var activeLangIds = new SNHelpUtil().getActiveLanguageIDs();
        var downloadedContentLang = gs.getProperty("com.glide.embedded_help.downloaded_content_language", "");
        var downloadedContentLangArr = downloadedContentLang && downloadedContentLang.split(",");
        var newLanguageFound = activeLangIds.length > downloadedContentLangArr.length;
        if (newLanguageFound) {
            for(var i = 0; i < activeLangIds.length; i++) {
                if (downloadedContentLang.indexOf(activeLangIds[i]) < 0 && new SNHelpUtil().isLegacyHelpAvailableForLang(activeLangIds[i], buildInitial)) {
                    new SNC.EmbeddedHelpContentDownloader().downloadContents(buildInitial);
                    triggerSync = false;
                    
                }
			}
		}
	}

	if(triggerSync)
		new SNC.EmbeddedHelpTrigger().triggerEmbeddedHelpSynchronizer(current.run_period);
}



// Synchronise Seismic Embedded Help content
new SNHelpUtil().syncSeismicHelp();
