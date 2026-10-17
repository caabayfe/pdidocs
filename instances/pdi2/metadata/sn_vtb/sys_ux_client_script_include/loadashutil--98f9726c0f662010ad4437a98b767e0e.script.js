function include({imports}) {
   const cloneDeep = (data) => {
        return JSON.parse(JSON.stringify(data));
    }

    /**
     * Gets the value at path of object. If the resolved value is undefined,
     * the defaultValue is returned in its place.
     */
    const get = function(object, path, defaultVal) {
        let pathArray;
        // If path is not defined or it has false value
        if (!path) return undefined;
        // Check if path is string or array. Regex : ensure that we do not have '.' and brackets
        pathArray = Array.isArray(path) ?
            path :
            path.split(/[,[\].]/g).filter(Boolean);
        // Find value if exist return otherwise return undefined value;
        return (
            pathArray.reduce(function(prevObj, key) {
                return prevObj && prevObj[key];
            }, object) || defaultVal
        );
    };

return {
   cloneDeep,
   get
 };
}
