
function include({ imports }) {

    /**
     * Gets the value based on path of object
     * ie: 
     * books[0].title
     * books[@name=goahead].name
     * books[*].name
     */
    function find(json, path) {
        return path.replace(/\[|\]\.?/g, '.').split(".").reduce(_parse, json);
    }

    function _parse(obj, key) {
        if (key && Array.isArray(obj)) {
            if (key.startsWith("@")) {
                let arr = key.split("=");
                if (arr.length < 2)
                    return null;
                return obj.filter(item => item[arr[0].substring(1)] == arr[1]);
            }
            if (key == "*")
                return obj;
            
            if (/^\d+$/.test(key))
                return obj[key];
            
            return obj.map(item => item[key]);
        }
        return key ? obj[key] : obj;
    }


    function update(json, key, value) {
        (typeof key == "string") ? _update(json, key, value) : Object.keys(key).forEach(k => _update(json, k, key[k]));
    }

    function _update(json, path, value) {
        let arr = path.split(".");
        let key = arr[arr.length - 1];
        arr.pop();
        let obj = find(json, arr.join("."));
        if (obj == null)
            return;
        if (Array.isArray(obj))
            obj.forEach(item => item[key] = value);
        else
            obj[key] = value;
    }


    return {
        find,
        update
    }
}
