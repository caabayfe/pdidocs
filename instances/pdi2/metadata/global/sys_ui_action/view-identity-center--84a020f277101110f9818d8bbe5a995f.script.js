function redirect() {
	    open('/now/identity-center/home/' + encodeURIComponent(parent.location.pathname + parent.location.search + parent.location.hash), '_self');
}
