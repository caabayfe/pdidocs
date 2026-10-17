function script({
    api,
    event
}) {
    const {
        name,
        previousValue,
        value
    } = event.payload;

    const isEmpty = value => {
        return (
            value == null || // obj == null is allowed to check null || undefined
            (typeof value === 'object' && Object.keys(value).length === 0) ||
            (typeof value === 'string' && value.trim().length === 0)
        )
    };

    const isEqual = function(a, b) {
        if (a == b) {
            return true;
        }
        if (a && !b || !a && b) {
            return false;
        }
        if (!(a instanceof Object) || !(b instanceof Object)) {
            return false;
        }
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
        if (aKeys.length === 0 && bKeys.length === 0) {
            return true;
        } // two empty objects are equal
        for (let i = 0; i < aKeys.length; i++) {
            if (!isEqual(a[aKeys[i]], b[aKeys[i]])) {
                return false;
            }
        }
        return true;
    };

    const emitRecordPropertyChanged = (name, previousValue, value) => {
        if (!isEqual(previousValue, value) && !isEmpty(value)) {
            api.emit("CTRL_RECORD#MACROPONENT_PROPERTY_CHANGED", {
                name,
                previousValue,
                value
            });
        }
    };

   emitRecordPropertyChanged(name, previousValue, value);

}
