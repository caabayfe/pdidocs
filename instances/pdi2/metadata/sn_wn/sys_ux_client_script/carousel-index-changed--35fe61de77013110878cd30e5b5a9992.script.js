/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var contentIdx = event.context.item.index;
    var carouselIdxArr = [...api.state.carouselIndexArr];
    carouselIdxArr[contentIdx] = event.payload.indicator;
    api.setState('poppedContentIndex', contentIdx);
    api.setState('carouselIndexArr', carouselIdxArr);
}
