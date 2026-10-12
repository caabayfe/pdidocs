var d = GlideXMLUtil.parse(current.state);
var e = GlideXMLUtil.getElementByTagName(d, "current_panel");
if (e != null)
  current.current_panel = e.getAttribute("id");
