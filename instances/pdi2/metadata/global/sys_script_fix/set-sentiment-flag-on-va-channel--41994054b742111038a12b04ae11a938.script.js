var sentiment_enabled = gs.getProperty('com.glide.cs.enable_sentiment_analysis', 'false');
if (sentiment_enabled == 'true') {
    var channelsString = gs.getProperty('com.glide.cs.sentiment_analysis_supported_channels', 'Amazon Connect, Contact Center');
    var channels = (channelsString.split(",")).map(function(channel) {
        return channel.trim();
    });
    var channelGr = new GlideRecord("sys_cs_channel");
    channelGr.addQuery("name", "IN", channels);
    channelGr.query();
    channelGr.sentiment_enabled = true;
    channelGr.updateMultiple();
}
