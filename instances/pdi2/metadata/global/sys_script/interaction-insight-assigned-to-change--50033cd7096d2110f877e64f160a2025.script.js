(function executeRule(current, previous /*null when async*/ ) {

    function isSentimentEnabled(channelName) {
        var channelGr = new GlideRecord('sys_cs_channel');
        channelGr.query('name', channelName);
        if (channelGr.next()) {
            return channelGr.getValue('sentiment_enabled') == '1';
        }
    }

    if (isSentimentEnabled(current.subtype)) {
        var sentimentUtil = new global.SentimentUtil();
        sentimentUtil.createInteractionInsight(current.channel_metadata_document, current.sys_id, previous.assigned_to);
    }
})(current, previous);
