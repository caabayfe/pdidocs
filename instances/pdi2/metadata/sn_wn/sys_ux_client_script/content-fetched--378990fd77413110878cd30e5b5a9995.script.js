/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    var res = api.data.fetch_whats_new_feature_content_1.output.result;
    var origRepeaterArr = [],
        carouselIndexArr = [];
    if (res) {
        res.content.forEach(item => {
            origRepeaterArr.push({
                'heading': item.title,
                'short_description': item.short_description,
                'text': item.content,
                'minimizedText': item.minimizedText,
                'imageArr': item.mediaArr,
                'available': item.available,
                'read': item.read,
                'documentation': item.doc_resource,
                'contentId': item.sys_id
            });
            carouselIndexArr.push(0);
        });
        api.setState('repeaterArr', origRepeaterArr);
        api.setState('pageHeading', res.title);
        api.setState('pageHeadingSubText', res.shortDescription);
        api.setState('carouselIndexArr', carouselIndexArr);
    }
    var obj = {};
    helpers.translate('See more').then((translatedText) => {
        obj.seeMore = translatedText;
    });
    helpers.translate('See less').then((translatedText) => {
        obj.seeLess = translatedText;
    });
    helpers.translate('Available').then((translatedText) => {
        obj.available = translatedText;
    });
    helpers.translate('Not available').then((translatedText) => {
        obj.notAvailable = translatedText;
    });
    api.setState('translatedText', obj);
}
