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
