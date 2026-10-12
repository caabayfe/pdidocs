var SitemapScheduler = Class.create();
SitemapScheduler.prototype = {
    initialize: function() {},

    generateSitemap: function() {
        try {
            var sitemapGenerator = new sn_ux_seo_sitemap.SitemapGenerator();

            // fetch active sitemap configurations
            var sitemapConfig = new GlideRecord('sys_ux_seo_sitemap_config');
            sitemapConfig.addActiveQuery();
            sitemapConfig.query();

            // generate sitemap for each configuration
            if (sitemapConfig.hasNext()) {
                while (sitemapConfig.next()) {
                    sitemapGenerator.generateSitemap(sitemapConfig.sys_id);
                }
            }else{
				gs.info(gs.getMessage('No active sitemap configurations found.'));
			}

        } catch (error) {
            gs.error('Sitemap scheduler error: {0}', error);
        }

    },
    type: 'SitemapScheduler'
};
