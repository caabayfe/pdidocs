function getDefaultContentType() {
	return gs.getProperty("glide.ui.email_client.html", "true") == "true" ? "text/html" : "text/plain";
}
