function transform(input) {
    	return JSON.parse(input.plugins).map(function(plugin) {  
    		return {  
    			id: plugin, 
    			active: GlidePluginManager.isActive(plugin)
    		};
    	});
    }
