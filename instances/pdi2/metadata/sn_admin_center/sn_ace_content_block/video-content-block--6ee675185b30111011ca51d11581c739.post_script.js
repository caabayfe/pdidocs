(function(context, pageParams) { /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */

    var applicationId = context.pageParams.applicationId;
    context.pageParams.videoData = getVideoContent(applicationId);

    function getVideoContent(applicationId) {
        var applicationGr = new GlideRecord('sn_admin_center_application');
        if (!applicationId || !applicationGr.get(applicationId))
            return {};

        return {
            title: gs.getMessage('{0} in action', applicationGr.getValue('name')),
            subtitle: gs.getMessage('{0}', applicationGr.getValue('video_description')),
            videoURL: generateYoutubeVideoURL(applicationGr.getValue('video_url'), applicationGr.getValue('video_description'))
        };
    }

    function generateYoutubeVideoURL(videoURL, videoDescription) {
        if (!videoURL)
            return '';
        var videoInfo = videoURL.split('v=');
        var videoId = videoInfo[1];

        if (!videoId)
            return '';

        var ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition != -1)
            videoId = videoId.substring(0, ampersandPosition);

        //Only youtube Video Support as we need to build embed Videos for youtube.
        var embedURL = 'https://www.youtube.com/embed/' + videoId;
        return encodeURI(embedURL);
    }

})(context, pageParams);
