function(scope, elem, attrs) {
	var panelHeight;

	$(document).ready(function() {
		resizeWindow();
	});

	$(window).resize(function() {
		resizeWindow();
	});

	function resizeWindow() {
		var panelHeight = ($(document).height()- 60) + 'px';
		$(elem).find('#pwd_reset_container').css('height', panelHeight);
	}
}
