var buildInitial = gs.getProperty("glide.buildname").substring(0,1).toLowerCase();

// This would be null on zboot, because this property is being set whenever a successful download goes through.
var lastDownloadedContent = gs.getProperty("com.glide.embedded_help.last_downloaded_content_family");

if (!lastDownloadedContent || lastDownloadedContent != buildInitial) {

	var mutex = new Mutex("Embedded_Help_Downloader");
	mutex.setSpinWait(1);
	mutex.setMaxSpins(1);

	if(mutex.get()) {
		try {
			new SNC.EmbeddedHelpContentDownloader().downloadContents(buildInitial);
			new SNHelpUtil().syncSeismicHelp();
		} catch(ex) {
			gs.log("Error downloading Help Content", "Embedded Help Downloader");
		} finally {
			mutex.release();
		}
	} else {
		gs.log("Could not obtain the mutex for Embedded_Help_Downloader", "Embedded Help Downloader");
	}
}
