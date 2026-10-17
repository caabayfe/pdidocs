function transform(input) {
    var experienceProperties = input.experienceProperties || {};
    var fetchResult = input.fetchResult || {};

    var knowledgeTable = (experienceProperties.knowledge_table && experienceProperties.knowledge_table.value) || "";

    var knowledgeResult = (
        fetchResult.data &&
        fetchResult.data.GlideRecord_Query &&
        fetchResult.data.GlideRecord_Query[knowledgeTable] &&
        fetchResult.data.GlideRecord_Query[knowledgeTable]._results &&
        fetchResult.data.GlideRecord_Query[knowledgeTable]._results[0]
    ) || {};
    var shortDescription = (knowledgeResult.short_description && knowledgeResult.short_description.displayValue) || {};
    var snippetHTML = (knowledgeResult.text && knowledgeResult.text.value) || "";
    var updated = (knowledgeResult.sys_updated_on && knowledgeResult.sys_updated_on.displayValue) || "";
    var views = (knowledgeResult.sys_view_count && knowledgeResult.sys_view_count.displayValue) || "";

    var footerLabel = gs.getMessage("Updated {0} · {1} views", [updated, views]);

    function getFooterLabelRichText(label) {
        return '<p className="now-card-footer-p"><span className="now-line-height-crop"><span className="now-card-footer-label" title="' + label + '">' + label + '</span></span></p>';
    }

    return {
        heading: {
            label: shortDescription
        },
        snippet: snippetHTML.replace(/<[^>]+>/g, ''),
        footerLabelRichText: getFooterLabelRichText(footerLabel)
    };
}
