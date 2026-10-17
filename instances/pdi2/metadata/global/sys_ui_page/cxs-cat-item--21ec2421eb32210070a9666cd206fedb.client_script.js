function clickItemLink(elem, event, id) {
	var target = event.target || event.srcElement;
	if (target.tagName && target.tagName.toLowerCase() == "a" && target.href)
		return true;
	if (elem != target && target.up("a.service_catalog"))
		return true;
	if (typeof $(target).up("#item_link_" + id) != "undefined")
		return false;
	var link = $("item_link_" + id);
	var href = link.href;
	var target = link.target;
	if (target == "_blank")
		window.open(href);
	else 
		top.parent.document.getElementById('gsft_main').src=href;
	Event.stop(event);
	return false;
}
