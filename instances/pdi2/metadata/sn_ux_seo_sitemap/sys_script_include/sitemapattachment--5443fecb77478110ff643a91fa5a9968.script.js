var SitemapAttachment = Class.create();
SitemapAttachment.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    getSitemapXMLDetails: function() {

        //get the sitemap configId from the parameter
        var sitemapConfigId = this.getParameter("sysparm_sitemap_config_id");

        var created_by = '';
        var created_on = '';
        var result = null;
		
		// Check if there exists a sitemap xml file generated for this sitemap config.
        var attachment = this.getAttachment(sitemapConfigId);
		
		// If the attachment exists , get the attachment created details
        if (attachment != null) {
            created_on = attachment.sys_created_on.getDisplayValue().substring(0, 10);
            created_by = attachment.sys_created_by.getDisplayValue();
            result = {
                "created_by": created_by,
                "created_on": created_on
            };
        }

        return JSON.stringify(result);

    },

    getAttachment: function(sitemapConfigId) {
        var sysAttachment = new GlideSysAttachment();
        var fileName = 'sitemap-' + sitemapConfigId + '.xml';
        var attachments = sysAttachment.getAttachments('sys_ux_seo_sitemap_config', sitemapConfigId);
        var sitemapXMLFile = null;
        while (attachments.next()) {
            if (attachments.getValue('file_name') == fileName) {
                sitemapXMLFile = attachments;
                break;
            }
        }
        return sitemapXMLFile;
    },
    isPublic: function() {
        return false;
    },
    type: 'SitemapAttachment'
});
