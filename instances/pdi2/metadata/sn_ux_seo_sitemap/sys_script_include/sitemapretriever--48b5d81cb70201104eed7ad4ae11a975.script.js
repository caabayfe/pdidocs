var SitemapRetriever = Class.create();
SitemapRetriever.prototype = {
    initialize: function() {
    },
	
    getSitemapXML: function(sitemapConfigId, pageNo) {
		var attachmentContent = gs.info(gs.getMessage("Invalid parameters. Kindly contact administrator for further assistance"));
		
		// fetch sys attachments based on the sitemapConfigId parameter passed
		try {
			var attachment = new GlideSysAttachment();
			var attachmentRecords = attachment.getAttachments('sys_ux_seo_sitemap_config', sitemapConfigId);

			// pattern match to find sitemapIndex file, if it exists else return the sitemap file
			var sitemapFilenameRegex = new RegExp('^(sitemap-[0-9]+-)');
			
			// iterate through all attachments available
      			while (attachmentRecords.next()) {
				if (pageNo) {
					if (attachmentRecords.file_name.startsWith('sitemap-'+pageNo)) {
						attachmentContent = attachment.getContent(attachmentRecords);
						break;
					}
				} else if (!sitemapFilenameRegex.test(attachmentRecords.file_name)) {
					attachmentContent = attachment.getContent(attachmentRecords);
					break;
				}
			}
		} catch (err) {
			gs.info("error while retrieving attachment for {0}", sitemapConfigId);
		}
		return attachmentContent;
    },
	
    type: 'SitemapRetriever'
};
