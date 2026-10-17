// wordcount too high for ai search, above 10,000
// wordcount too low for SEO, e.g. below 300
const analyzeWordCount = () => {
    const extractTextFromTags = html =>
        // Strip non-content elements (script/style/etc. don't nest in KB content,
        // so a simple non-recursive tag-pair removal is safe), then let countWords
        // strip all remaining tags. Avoids allow-list backreference matching, which
        // breaks on nested same-name tags (e.g. <div><div>...) by pairing an opening
        // tag with the nearest closing tag instead of its true matching one.
        html.replace(/<(script|style|svg|noscript|template)[^>]*>[\s\S]*?<\/\1>/gi, ' ');

    const countWords = (text) => {
        // Remove any remaining HTML tags
        const cleanText = text.replace(/<[^>]+>/g, ' ');
        // Normalize whitespace
        const normalized = cleanText.replace(/\s+/g, ' ').trim();
        if (!normalized) return 0;
        // Match CJK/kana characters individually (Chinese + Japanese — no spaces between words,
        // each character is a meaningful unit), or contiguous Unicode letter sequences for all
        // other scripts (Korean, Latin, Arabic, etc.).
        const words = normalized.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]|\p{L}+/gu) || [];
        return words.length;
    };

    // Get the article content that corresponds to record
    const articleContent = new global.KBViewModel().getArticleContentBySysId(target.getUniqueValue());
    const wordcount = countWords(extractTextFromTags(articleContent));

    let msg = "";

    if (wordcount < 300) {
        msg = gs.getMessage("This article is less than the minimum length that search providers will use for SEO and it may not appear in search results. Consider lengthening the article length to more than 300 words.");
    } else if (wordcount > 10000) {
        msg = gs.getMessage("This article exceeds the maximum length that search providers can index and it may not appear in search results. Consider shortening the article length to not exceed 10,000 words.");
    }

    if (msg) {
        const result = {
            ...utils.createOpenResult(msg)
        };
        // Article optimization scan results
        results.push(result);
    }
};

// Run the scan
analyzeWordCount();
