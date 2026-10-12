(function executeRule(current, previous /*null when async*/ ) {

    function validDuration(val) {
        var regex = /^\d+(\.\d+)?(s|m|h|d|ms|ns|us)$/;
        return val.match(regex);
    }

    function validInt(val) {
        return val == parseInt(val, 10);
    }

    function validDouble(val) {
        return !isNaN(Number(val));
    }

    function validBoolean(val) {
        return val.toLowerCase() == "true" || val.toLowerCase() == "false";
    }

    function validDataSize(val) {
        var regex = /^([\d]+)(\.)?([\d]*)[kMGTP]?B$/;
        return val.match(regex);
    }

    function validate(type, val) {
        if (type == "duration" && !validDuration(val)) {
            return false;
        } else if (type == "integer" && !validInt(val)) {
            return false;
        } else if (type == "double" && !validDouble(val)) {
            return false;
        } else if (type == "boolean" && !validBoolean(val)) {
            return false;
        } else if (type == "data_size" && !validDataSize(val)) {
            return false;
        }

        return true;
    }

    var type = current.getValue("type");
    var val = current.getValue("value");

    // validate based on data types mentioned here: https://trino.io/docs/current/admin/properties.html
    if (!validate(type, val)) {
        gs.addErrorMessage("Invalid data type, input must match type " + type);
        current.setAbortAction(true);
    }

})(current, previous);
