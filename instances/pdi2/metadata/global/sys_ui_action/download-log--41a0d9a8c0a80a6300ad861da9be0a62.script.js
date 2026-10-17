function bytesToBucket(bytes) {
    bytes = parseFloat(bytes);
	
	if (isNaN(bytes))
		return "Unknown";
	
    var bucket;

    if (bytes < 1000)
        bucket = "<1KB";
    else if (bytes <= 50000)
        bucket = "1-50KB";
    else if (bytes <= 100000)
        bucket = "50-100KB";
    else if (bytes <= 500000)
        bucket = "100-500KB";
    else if (bytes <= 1000000)
        bucket = "500KB-1MB";
    else if (bytes <= 50000000)
        bucket = "1-50MB";
    else if (bytes <= 100000000)
        bucket = "50-100MB";
    else if (bytes <= 500000000)
        bucket = "100-500MB";
    else if (bytes <= 1000000000)
        bucket = "500MB-1GB";
    else if (bytes <= 5000000000)
        bucket = "1-5GB";
    else
        bucket = ">5GB";
	
	return bucket;
}

// client-side code called onClick
function trackDownloadedFile() {
	var bucket = bytesToBucket(g_form.getValue('size'));
	
    GlideUXMetrics && GlideUXMetrics.track('Download Log File', {
        'File Name': g_form.getValue('name'),
        'File Size': bucket
    });
    // re-run this entire script so server-side code executes
    gsftSubmit(null, g_form.getFormElement(), 'download_log');
}

// after gsftSubmit() is called onClick, script execution continues from here
// ensure we only run server-side code by checking if the client window is undefined
if (typeof window == 'undefined')
    downloadFile();

// server-side code called above
function downloadFile() {
    // redirect to download the file
    gs.setRedirect("download_file.do?sysparm_parent=logs&sysparm_child=" + current.name);
}
