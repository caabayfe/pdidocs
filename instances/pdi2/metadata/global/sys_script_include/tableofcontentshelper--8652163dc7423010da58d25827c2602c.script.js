var TableOfContentsHelper = Class.create();
TableOfContentsHelper.prototype = {
    initialize: function() {},
    /**
     * Function to check the presence of a toc tag
     * @param {string} text - text to check for the presence of the toc tag
     * @returns {boolean} true/false indicating the presence/absence of the toc tag in the given string
     */
    checkTOCTagPresence: function(text) {
        var tocCaptureRegex = /<sn-toc>(.*?)<\/sn-toc>/;

        var matchAndCapture = text.match(tocCaptureRegex);
        var tagPresent = true;
        if (!matchAndCapture || matchAndCapture.length != 2) {
            tagPresent = false;
        }
        return tagPresent;
    },
    /**
     * Function to check if the table of contents config requires a page number config
     * @param {string} tableOfContentsConfigId table of contents config sys id
     * @returns {boolean} true/false indicating if a page number config is required for the table of contents config
     */
    isPageNumberConfigRequired: function(tableOfContentsConfigId) {
        if (gs.nil(tableOfContentsConfigId))
            return false;

        var tableOfContentsConfigGr = new GlideRecord('doc_toc_config');
        if (!tableOfContentsConfigGr.get(tableOfContentsConfigId) || !tableOfContentsConfigGr.canRead())
            return false;

        var showPageNumber = tableOfContentsConfigGr.show_page_numbers;
        return showPageNumber;
    },

    type: 'TableOfContentsHelper'
};
