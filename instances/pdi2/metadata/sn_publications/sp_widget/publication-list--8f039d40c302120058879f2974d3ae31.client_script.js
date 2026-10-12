function($scope) {  
	var c=this;
	c.getContent=function(encoded){
		var elem = document.createElement('textarea');
		elem.innerHTML = encoded;
		return elem.value;
	}
}
