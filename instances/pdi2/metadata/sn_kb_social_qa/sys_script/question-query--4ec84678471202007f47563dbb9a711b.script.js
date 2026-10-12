(function executeRule(current, previous /*null when async*/) {
	
var RESTRICT_ME_KB = ['textsearch.do'];
if (gs.getSession().isInteractive() && shouldRestrict()) 
    var p = current.addQuery("language", gs.getSession().getLanguage());


function shouldRestrict() {
    try {
        var url = RP.getParameterValue('sysparm_this_url');
        for (var i = 0; i < RESTRICT_ME_KB.length; i++)       
            if (url.indexOf(RESTRICT_ME_KB[i]) > -1)  
                return true;
    } catch(e) {
       // catch for those cases where RP is not in scope
    }
    return false;
}

})(current, previous);
