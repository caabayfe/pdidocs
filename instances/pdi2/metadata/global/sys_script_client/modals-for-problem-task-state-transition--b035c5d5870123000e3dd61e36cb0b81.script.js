function onLoad() {

	var isMobile = false;
	var ua = window.navigator.userAgent;
	if( ua.match(/Android/i) ||
		ua.match(/webOS/i) ||
		ua.match(/iPhone/i) ||
		ua.match(/iPad/i) ||
		ua.match(/iPod/i) ||
		ua.match(/BlackBerry/i) ||
		ua.match(/Windows Phone/i))
			isMobile = true;

	var view = g_form.getViewName();
	if(view === "ptask_cancel_dialog_view" || view === "ptask_complete_dialog_view_1" || view === "ptask_complete_dialog_view_2" || view === "ptask_assess_dialog_view") {
 		document.getElementById("page_timing_div").style.display = "none";
		document.getElementById("problem_task.form_scroll").classList.remove("touch_scroll");
		
		// Moved Scroll removing logic from ProblemModalUIHelpers for DEF0191449 now only removing Scroll selectively from modals that don't have textArea component which can overflow. 
		var textAreaPlusSign = document.querySelector('[id^="sizer_plus_problem"]');
		if(!textAreaPlusSign) {
			// If the modal does not have even one text area then we can remove the scroll behaviour.
			var el = document.getElementById("problem_task.form_scroll");
			if (!!el)
				el.style.overflow = 'hidden';
		}
		
		var templateBar = document.getElementById("template-bar-aria-container");
		if(templateBar)
			templateBar.style.display = "none";
		// Removing the 'templates' class in order to avoid adding 50px padding
		setTimeout(function () {
			var sectionHeader = document.documentElement;
			if(sectionHeader)
				sectionHeader.removeClassName('templates');
		}, 0);
		var buttonsArray = $j(".form_action_button:not(#sysverb_modal_ok_bottom,#sysverb_modal_cancel_bottom)");
		for(var i = 0; i < buttonsArray.length; i++) {
			buttonsArray[i].style.display = 'none';
		}
		var formActionContainer = document.getElementsByClassName("form_action_button_container")[0];
		formActionContainer.style.paddingTop = "20px";
		formActionContainer.style.paddingLeft = "80%";

		if(view == "ptask_complete_dialog_view_1")
			formActionContainer.style.paddingLeft = "85%";

		if(isMobile)
			formActionContainer.style.paddingLeft = "305px";
		
		var relatedLinks = document.getElementsByClassName("related_links");
		if(relatedLinks.length>0)
			relatedLinks[0].style.display = "none";
		var linksContainer = document.getElementsByClassName("related_links_container");
		if(linksContainer.length>0)
			linksContainer[0].style.display = "none";
	}
}
