function onLoad() {
	var sectionsMissingClass = document.querySelectorAll('.section-content:not(.with-overflow)');
	
	sectionsMissingClass.forEach(function (section) {
		section.classList.add("with-overflow");
	});
}
