// Disable all links in ready-only page
window.onload = function() {
    var anchors = document.getElementsByTagName("a");
    for (var i = 0; i < anchors.length; i++) {
		anchors[i].style['pointer-events'] = 'none';
		
		if (anchors[i].className.indexOf("btn") > -1)
			anchors[i].style.display = 'none';
		
		var spanFields = anchors[i].getElementsByTagName("span");
		for (var j = 0; j < spanFields.length; j ++) {
			if (spanFields[j].className.indexOf("btn") > -1)
				spanFields[j].style.display = 'none';
		}
    }
};
