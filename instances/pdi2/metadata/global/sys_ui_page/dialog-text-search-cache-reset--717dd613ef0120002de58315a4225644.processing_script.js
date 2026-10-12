resetTextSearchCaches();
function resetTextSearchCaches() {
	new GlideTSUtil().flushClusterCaches();
	var urlOnStack = GlideSession.get().getStack().bottom();
	response.sendRedirect(urlOnStack);
}
