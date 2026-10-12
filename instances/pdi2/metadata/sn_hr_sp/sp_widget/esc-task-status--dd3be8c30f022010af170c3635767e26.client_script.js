api.controller=function() {
  /* widget controller */
  var c = this;
	
	if (c.options.hasOwnProperty('link') && c.options.link)
		c.options.link_text = (c.options.link.hasOwnProperty('text') && c.options.link.text) ? c.options.link.text : c.options.link.url;
	
	if (!c.options.anchor_target)
		c.options.anchor_target = '_blank';
};
