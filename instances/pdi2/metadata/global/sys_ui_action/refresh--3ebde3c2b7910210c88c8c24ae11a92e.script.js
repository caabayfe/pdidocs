//Remove the last refreshed time from the cache, which will tell the table to refresh on the next query made to it
function reload() {
	GlidePropertiesDB.set("com.glide.update.metadata.risk.last_refreshed", "")
	location.reload();
}

reload();
