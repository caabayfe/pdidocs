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

    const {
        source
    } = api.context.props.payload.props_details;
    if (!source)
        return '';
    var videoInfo = source.split('v=');
    var videoId = videoInfo[1];

    if (!videoId)
        return '';

    var ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition != -1)
        videoId = videoId.substring(0, ampersandPosition);

    //Only youtube Video Support as we need to build embed Videos for youtube.
    var embedURL = 'https://www.youtube.com/embed/' + videoId;
    api.setState('embedVideoUrl', embedURL);



}
