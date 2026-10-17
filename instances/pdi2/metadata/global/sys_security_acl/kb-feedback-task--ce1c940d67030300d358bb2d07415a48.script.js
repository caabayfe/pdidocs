(function(){
	//Allow access if can read the parent task record
	if (current.parent) {
		var gr = new GlideRecord('task');
		return gr.get(current.parent) && gr.canRead();
	}
	return true;
})();
