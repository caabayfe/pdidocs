(function(current) {

    // The application file being operated on is current. The function must return a boolean. 

    if (!gs.nil(current.super_class.name) && current.super_class.name.toString() === 'sys_import_set_row') {
        return true;
    }
	
    return false;

})(current);
