mapBoards();

function mapBoards() {
	var oldToNewMapping = {
		'3' : '2', //red -> red
		'4' : '3', //orange -> orange
		'5' : '4', //yellow -> yellow
		'6' : '5', //green -> green
		'7' : '5', //shamrock -> green
		'8' : '6',//aqua -> blue
		'9' : '6',//cyan -> blue
		'10' : '6',//blue mix -> blue
		'11' : '9', //purple -> purple
		'12' : '10'	//concours blue -> charcoal gray
	};
	for(var key in oldToNewMapping) {
		mapBoardsForColor(key, oldToNewMapping[key]);
	}
}

function mapBoardsForColor(oldColorNum, newColorNum) {
	var boards = new GlideRecord('vtb_board');
	boards.addQuery('background_color', 'vtb-board-color-' + oldColorNum);
	boards.setValue('background_color', 'vtb-board-color-' + newColorNum);
	boards.updateMultiple();
}
