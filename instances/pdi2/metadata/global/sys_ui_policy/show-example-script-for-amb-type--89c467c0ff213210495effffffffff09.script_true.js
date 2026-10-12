function onCondition() {
    var exampleScript =
        "// Example AMB ACL Script\n" +
        "// ----------------------\n" +
        "// answer = current.channelSegments[1] === 'incident';\n\n" +
        "// gs.log(current); // AMBAuthorizationContext{ChannelPrefix=/test/**, ChannelId=/test/tableName, ChannelSegments=[test, tableName]}\n\n" +
        "// gs.log(current.channelSegments.length); // 2\n" +
        "// gs.log(current.channelPrefix);          // /test/**\n" +
        "// gs.log(current.channelId);              // /test/tableName\n" +
        "// gs.log(current.channelSegments[0]);     // test\n" +
        "// gs.log(current.channelSegments[1]);     // tableName\n";

    if (!g_form.getValue('script')) {
        g_form.setValue('script', exampleScript);
    }
}
