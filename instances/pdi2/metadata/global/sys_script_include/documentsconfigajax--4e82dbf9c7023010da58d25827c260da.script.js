var DocumentsConfigAJAX = Class.create();
DocumentsConfigAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    /**
     * Function to determine if the table of contents config requires a page number config
     * @param {sysparm_toc_config} table of contents config sys id
     * @return true/false indicating if a page number config is required for the table of contents config
     */
    isPageNumberConfigRequired: function() {
        var tableOfContentsConfigId = this.getParameter('sysparm_toc_config');
        if (gs.nil(tableOfContentsConfigId))
            return false;
        var tocHelper = new TableOfContentsHelper();
        return tocHelper.isPageNumberConfigRequired(tableOfContentsConfigId);
    },

    isTOCandPageNumberConfigSupported: function() {
        var propertyValue = GlideProperties.get('com.snc.pdfgenerator.html2pdf.api.version');
        if (propertyValue == '2')
            return true;
        else
            return false;
    },

    type: 'DocumentsConfigAJAX'
});
