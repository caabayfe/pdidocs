// section collapser
function hideRevealAll(sectionNameStarts, tagName, triggerID){
	var t = document.getElementById(triggerID);
	if (t) 
		var tVis = t.style.display;
		
	var els = document.getElementsByTagName(tagName);
	
	if (els) {
		for(var c=0;c<els.length;++c) {
			if ( els[c].id.indexOf(sectionNameStarts) == 0 ) {
				var el = gel(els[c].id);
				var img = gel("img." + els[c].id);
				var imageName = "section";
				if (tVis == 'block') {
					if (el.style.display == 'block') {
						hide(el);
						if (img) {
							img.src = "images/"+imageName+"_hide.gifx";
                            img.alt = 'Expand';
                            img.title = 'Expand';
                        }
					}
				} else {
					if (el.style.display != 'block') {
						show(el);
						el.style.height = 'auto';
						if (img) {
							img.src = "images/"+imageName+"_reveal.gifx";
                            img.alt = 'Collapse';
                            img.title = 'Collapse';
                        }
					}
				}
			}
		}
	}
}
