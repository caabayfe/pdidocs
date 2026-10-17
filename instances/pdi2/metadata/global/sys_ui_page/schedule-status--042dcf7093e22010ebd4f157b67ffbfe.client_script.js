(function(){
	var modifyIconColor = function() {
		if(gel("view") && gel("view").value == "failure") {
			var elements = document.getElementsByClassName("table-btn-lg");
			if (elements && elements.length == 0)
				return;
			for(var i=0; i<elements.length; i++ ){
				elements[i].style.color = "#C83C36";
			}
		}
    };
	CustomEvent.observe('list.loaded', modifyIconColor);
	CustomEvent.observe('partial.page.reload', modifyIconColor);
})();
