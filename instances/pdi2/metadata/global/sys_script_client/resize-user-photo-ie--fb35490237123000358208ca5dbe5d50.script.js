/**
 * Resize user image to max-height and max-width if browser is IE
 */
function onLoad() {
	var uImg = $$(".user_image")[0];
	
	if (uImg && isMSIE) {
		// resize height
		var h = uImg.getLayout().get('height');
		var mh = parseInt(uImg.getStyle('max-height').sub('px', ''), 10);
		uImg.height = (h > mh) ? mh : h;
		// resize width
		var w = uImg.getLayout().get('height');
		var mw = parseInt(uImg.getStyle('max-width').sub('px', ''), 10);
		uImg.width = (w > mw) ? mw : w;
	}
	
}
