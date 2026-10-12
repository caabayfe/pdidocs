function(scope,element,attr){
	var c = scope.c;
	if (window && window.parent && window.parent.NOW && window.parent.NOW.CustomEvent && window.parent.NOW.CustomEvent.fireTop) {
	    window.parent.NOW.CustomEvent.fireTop(
	        'magellanNavigator.permalink.set', {
	            title: window.document.title,
	            relativePath: window.location.pathname + window.location.search + window.location.hash
	        }
	    );
	}
	function openedInIframe () {
		if(window.parent && window.parent.location.pathname == '/gtb.do' )
			return false;
		try {
			return ((window.self !== window.top) && (window.top.location.href.includes('now/nav') || window.top.location.href.includes('nav_to')
))||(window.opener && window.opener.document.getElementById("section_form_id") != null && c.data.sysparm_kb_search_table);
		} catch (e) {
			return false;
		}
	}
	
	if(openedInIframe())
		$("header nav").css("display","none");
		
	if(scope.data.set_foccus)
		setTimeout(function(){
			element.find('input[name=query]').focus();
		},0);
}
