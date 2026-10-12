function closeAndRedirectForm() {
      if(!window)
        globalThis.window.location.href = 'ws_blank_page.do';
	  else
		window.location.href = 'ws_blank_page.do';
}
