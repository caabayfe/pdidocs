(function (finding, current) {

	if(gs.getProperty('glide.ui.attachment.force_download_all_mime_types') == 'false'){
		finding.increment();
	}

})(finding, current);
