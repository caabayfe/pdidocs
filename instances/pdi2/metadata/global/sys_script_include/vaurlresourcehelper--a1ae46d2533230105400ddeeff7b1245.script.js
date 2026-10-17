var VAURLResourceHelper = Class.create();

VAURLResourceHelper.KEY_TABLE = 'table';
VAURLResourceHelper.KEY_SYS_ID = 'sys_id';

/**
* Returns a map that contains table name and sys_id
*/
VAURLResourceHelper.getResourceMap = function getDocumentInfoMap(url) {
	
	var result = {};
	
	var found = getHostAndPathFromURL(url);
	
	var host = found.host;
	var path = found.path;
	
	if(gs.nil(host) || gs.nil(path))
		return result;
	
	var pathName = getPathNameFromPath(path);
	
	// get the query parmas
	var queryParams = getQueryParams(url);
	
	if (canBePortal(pathName) && handlePortalURL(url, queryParams, result)) {
		//The url can be generated for a portal.
		return result;
	}
	else if (path.indexOf('nav_to.do') != -1) {
		
		// the patter is https://<host>/nav_to.do?uri=.....
		var token = 'uri=';
		var index = path.indexOf(token);
		var uri = path.substring(index + 4);
		
		// this uri is encoded. so need to decode it.
		uri = decodeURIComponent(uri);
		
		// get the query params from uri
		var uriParams = getQueryParams(uri);
		
		var sysId = uriParams['sys_id'];
		if(!gs.nil(sysId))
			result[VAURLResourceHelper.KEY_SYS_ID] = sysId;
		
		var table = getTableNameFromPath(uri);
		if(!gs.nil(table))
			result[VAURLResourceHelper.KEY_TABLE] = table;
		
		//special handling for KB if sysId is not found yet.
		if( gs.nil(sysId) && !gs.nil(uriParams['sys_kb_id'] )) 
			result[VAURLResourceHelper.KEY_SYS_ID] = uriParams['sys_kb_id'];	
		
	}
	
	// the default url patter: https://<host>?<table_name>.do?sys_id=....
	
	if (path.indexOf(".do?") != -1 && !gs.nil(queryParams['sys_id'])) {
		result[VAURLResourceHelper.KEY_SYS_ID] = queryParams['sys_id'];
		result[VAURLResourceHelper.KEY_TABLE] = getTableNameFromPath(path);
	}
	
	return result;
};

function handlePortalURL(url, queryParams, collector) {

	var sysId = queryParams['sys_id'];
	var table = queryParams['table'];
	var id = queryParams['id'];
	
	// if sysId is not found, no need to proceed.
	if (sysId == null)
		return false;
	
	collector[VAURLResourceHelper.KEY_SYS_ID] = sysId;
	
	if (table != null) {
		// if table exists, no need to proceed. all done.
		collector[VAURLResourceHelper.KEY_TABLE] = table;
		return true;
	}
	
	// if sys_id found but table is missing, id can be used to obtain table.
	if (id == null)
		return false;
	
	// get table by id..
	table = getTableNameById(id);
	
	// still not found? give up..
	if(gs.nil(table))
		return false;
	
	collector[VAURLResourceHelper.KEY_TABLE] = table;
	return true;
}

function getPathNameFromPath(path) {
	var index = path.indexOf('?');
	var pathName = (index == -1)? path : path.substring(0,index);
	pathName = pathName.replace('/','');
	return pathName;
}

function getTableNameFromPath(path) {

	var tableName =null; 
	var tmp = path;
	
	if(path.startsWith('/'))
		tmp = path.substring(1);
	
	var index = tmp.indexOf('.do?');
	if(index != -1)
		tableName = tmp.substring(0,index); 
	
	// remove if '_list' is found
	if (tableName.indexOf('_list'))
		tableName = tableName.replace('_list','');
	
	return tableName;
}	

function getTableNameById(id) {
	
	// this logic is hardcoded now. Will need to be replaced the logic with dynamic lookup
	if (id.indexOf("user_profile") != -1) {
		return 'sys_user';
	}
	else if	(id.indexOf("kb_") != -1) {
		return 'kb_knowledge';
	}
	return null;
}

function canBePortal(pathName) {
	return pathName.indexOf(".do?") == -1;
}

function getHostAndPathFromURL(url) {
	
	var obj = {};
	var urlParts = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(url);
	
	if(gs.nil(urlParts) || urlParts.length<3)
		return obj;
	
	var hostname = urlParts[1]; // www.example.com
	var path = urlParts[2]; // /path/to/somwhere
	
	obj.host = hostname;
	obj.path = path;
	
	return obj;
}

function isSameHost(host) {
	var instance = gs.getProperty("glide.servlet.uri");
	return instance.indexOf(host) != -1;
}

function getQueryParams(url) {
	
	var index = url.indexOf("?");
	
	if(index == -1)
		return new {};

	var queryString = url.substring(index+1);
	var params = queryString.split("&");
	var map = {};

	for (var i=0; i<params.length; i++ ) {
		var param = params[i];
		var name = param.split("=")[0];  
		var value = param.split("=")[1];  
		map[name] = value;    
	}  
	return map;  
}
