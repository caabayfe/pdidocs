api.controller = function($scope) {
    /* widget controller */
    var c = this;
	
    c.exitIR = function() {
        c.server.get({
            action: 'iar_optout'
        }).then(function(response) {
			if (!response.data.error)
				$scope.$emit("$sp.iar_exited");
        });
    };
	
	if (c.data.action == "iar_optout") {
		c.exitIR();
	}
};
