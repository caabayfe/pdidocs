$j(document).ready(function(){
	function makeRowsTabable() {
		$j('.list2_body tr.list_row').each(function(idx, e) {
			e.setAttribute('tabIndex', '0');
		});
	}

	function isIE11() {
		// Is this IE11. See http://msdn.microsoft.com/en-us/library/ms537503(v=vs.85).aspx
		return navigator.userAgent.indexOf("Trident/7.0") >= 0 &&
			navigator.userAgent.indexOf("rv:11.0") >= 0;
	}

	CustomEvent.on('partial.page.savePreviousEditor', function(e) {
		setTimeout(function() {
			makeRowsTabable();
		}, 100);
	});

	$j('#page_timing_div').hide();
	$j('.wflistbutton').click(function(){
		$j('.segmented-pane').attr('aria-hidden', true);
		var section = $j(this).attr('aria-controls');
		$j('.wflistbutton').removeClass('state-active');
		$j('.segmented-pane').hide();
		$j(this).addClass('state-active');
		$j('#'+section).show();
		$j('#'+section).attr('aria-hidden', false);
		if (section === "segmented3" && isIE11()) { //Help tab
			$j('#'+section).attr('aria-hidden', true);
		}
	});

	if (top && top.workflowIDE) {
		var lists = GlideList2.getListsForTable('wf_workflow_version');
		if (typeof top.workflowIDE.registerRefreshWelcome === "function")
			top.workflowIDE.registerRefreshWelcome(function(){
				lists.each(function(e){e.refreshWithOrderBy();});
			});
		$j('div.tabs2_list').delegate('tr[record_class="wf_workflow_version"]','click',function(){
			var wfv_id = $j(this).attr('sys_id');
			var wf_name = '' + $j(this).children("td.vt")[0].innerHTML;
			top.workflowIDE.newCanvas(wf_name, wfv_id);
		});
	 }

	// remove bottom link from tabindex
	var listDivs = $j('.list_div');
	for (var x = 0; x < listDivs.length; x++) {
		var bottomLinkName = listDivs[x].id + "_bottom";
		$j('#' + bottomLinkName).attr('tabindex', '-1');
	}

	function getJumpToLink() {
		var j = $j("<div />").attr({
			"class": "welcome-jump-to-top-link wf-skip-link wf-skip-to-main-link jump-to-top pull-left",
			"tabindex": "0",
			"role": "button"
		})
		.html("Jump to top")
		.on('click', function(evt) {
			if (top.canvasTabAccessibilityManager)
				top.canvasTabAccessibilityManager.focusInitialLink(evt);
		})
		.on('keydown', function(evt) {
		  if (evt.key === 'Tab' && !evt.shiftKey) {
		    if (top.rightColumnTabAccessibilityManager)
		      top.rightColumnTabAccessibilityManager.focusInitialLink(evt);
		      evt.stopPropagation();
		      evt.preventDefault();
		  }
		  if (evt.keyCode === 13 || evt.keyCode === 32) {
		    if (top.canvasTabAccessibilityManager)
				top.canvasTabAccessibilityManager.focusInitialLink(evt);
		  }
		});

		return j;
	}

	// add in jump-to-top buttons
	$j('.segmented-pane').append($(getJumpToLink()));
	
	// make soft-tabs navigatible via arrow keys
	$j('.sn-navhub-content a.btn.sn-navhub-btn').on('keydown', function(evt) {
		if (evt.key.indexOf('Right') == -1 && evt.key.indexOf('Left') == -1 && evt.key != 'Tab')
			return;

		$j('.wflistbutton').each(function(i,e) {
			e.setAttribute('aria-selected', false);
		});

		if (evt.key.indexOf('Right') > -1) {
			var t = evt.target.next();
			if (!t.hasClassName('wflistbutton'))
				return;

			t.setAttribute('aria-selected', true);
			t.click();
			t.focus();
		}

		if (evt.key.indexOf('Left') > -1) {
			var t = evt.target.previous();
			if (!t || !t.hasClassName('wflistbutton'))
				return;

			t.setAttribute('aria-selected', true);
			t.click();
			t.focus();
		}

		if (evt.key == 'Tab') {
			if (evt.shiftKey) {
				if (top.canvasTabAccessibilityManager)
					top.canvasTabAccessibilityManager.focusLastTab();

				evt.stopPropagation();
				evt.preventDefault();
				return;
			}

			$j('.btn.btn-primary.new-btn').focus();
			evt.preventDefault();
			evt.stopPropagation();
		}

		return;
	});

	$j('#new-workflow-btn').on('keydown', function(evt) {
		if (evt.keyCode == 32) { // space
			$j('#new-workflow-btn').click();
			evt.preventDefault();
			evt.stopPropagation();
		}
	});

	// fix the tabindex of the light tabs
	$j('.sn-navhub-content a.btn.sn-navhub-btn').on('focus', function(evt) {
		var currentTab = evt.target.getAttribute('tab_id');
		var otherTabs = $j('.wflistbutton');
		for (var x = 0; x < otherTabs.length; x++) {
			if (otherTabs[x].getAttribute('tab_id') == currentTab)
				otherTabs[x].setAttribute('tabindex', '0');
			else
				otherTabs[x].setAttribute('tabindex', '-1');
		}
	}.bind(this));

	makeRowsTabable();

	// accessibility
	$j("body").attr("role", "application");
});
