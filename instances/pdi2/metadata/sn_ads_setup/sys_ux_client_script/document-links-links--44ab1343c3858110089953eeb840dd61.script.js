/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    let related_content = api.state.pageInput.step2.related_content;
    let emptyLink = [{
        "type": "article",
        "title": "",
        "description": "",
        "url": ""
    }];
    if (related_content && related_content.length > 0) {
        return related_content;
    }
    return emptyLink;
}
