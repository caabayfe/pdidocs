var msgUtil = new LiveMsgUtil(current); 

//get links
if (current.has_links) {
    template.print("<br />"); //blank line
    template.print("Links:<br />");
    var links = msgUtil.getLinks();
    for (var i = 0; i < links.length; i++) {
        var url = links[i].url;
        var text = links[i].text;
        var htmlLink = '<a href="' + url + '">' + text + '</a>';
        template.print(htmlLink);
        template.print("<br />");
    }
}

if (!current.reply_to.nil()) {
   template.print("<br />... to message:<br />");
   var replyToMsg = msgUtil.getReplyToMsgWithName();   
   template.print(replyToMsg);
   template.print("<br />");
}

if (!current.in_reply_to.nil()) {
    template.print("<br />");
    template.print("... in the thread:<br />");
    var baseMsg = msgUtil.getBaseMsgWithName();
    template.print(baseMsg);
}
