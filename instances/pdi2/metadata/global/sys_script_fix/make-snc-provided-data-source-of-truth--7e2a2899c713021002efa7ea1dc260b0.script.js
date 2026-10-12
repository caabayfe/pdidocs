var currentValue = GlidePropertiesDB.get('com.glide.stats.storage_disk_usage.information_schema');
if (currentValue != null && currentValue.equals('true'))
	GlidePropertiesDB.set('com.glide.stats.storage_disk_usage.information_schema', 'false');
