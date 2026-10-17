/**
 * This class is intended to contain membership relationships in a memory efficient manner so that they can be
 * loaded into memory and used without incremental database calls for each request. The initial use case is to
 * store userIds and the associated roleIds that the user has. However, this class is flexible enough to hold
 * other types of data that conform to the same sort of relationship.
 */
var MembershipInMemoryCache = Class.create();
MembershipInMemoryCache.prototype = {
    /**
     * Constructor that takes a data provider and key/value names to load data from and cache in memory.
     * Since this class doesn't need to know where the data is coming from, only how to retrieve it,
     * the key/value names are to provide flexibility for varying data sources.
     *
     * @param glideRecord Glide record object that provides data
     * @param keyName The name of the key for the data (e.g. userId)
     * @param valName The name of the key for the value (e.g. roleId)
     * @param maxValueCount The max number of values expected
     * @param keyCount The number of keys expected
     */
    initialize: function(glideRecord, keyName, valName, maxValueCount, keyCount) {
        this._maxValueCount = maxValueCount;
        this._bitmap = [];
        /* Ensure that there's enough array slots in this._bitmap which hold 32bit words
		to accomodate all keys and values.
		Specifically, that there's enough space to hold keyCount * maxValueCount bit.
		The new array slots are initialized with 0.
		*/
        this._bitmap.length = Math.floor((maxValueCount * keyCount + 30) / 31);
        this._bitmap.fill(0);
        this._loadData(glideRecord, keyName, valName);
    },

    /**
     * Retrieves the values associated with the provided id
     *
     * @param id The id to fetch data for. (e.g. userId)
     */
    getValsById: function(id) {
        if (!this._keys.has(id))
            return [];
        const keyIndex = this._keys.get(id);

        let vals = [];
        for (let valueIndex = 0; valueIndex < this._maxValueCount; valueIndex++) {
            if (this._isSet(keyIndex, valueIndex))
                vals.push(this._vals[valueIndex]);
        }

        return vals;
    },

    /**
     * Load data into memory in a memory efficient manner.
     *
     * @param glideRecord Glide record object that provides data
     * @param keyName The name of the key for the data (e.g. userId)
     * @param valName The name of the key for the value (e.g. roleId)
     */
    _loadData: function(glideRecord, keyName, valName) {
        const keys = new Map();
        const values = new Map();

        while (glideRecord.next()) {
            const key = glideRecord.getValue(keyName);
            const val = glideRecord.getValue(valName);

            if (!keys.has(key))
                keys.set(key, keys.size);
            if (!values.has(val))
                values.set(val, values.size);
            const keyIndex = keys.get(key);
            const valueIndex = values.get(val);

            this._set(keyIndex, valueIndex);
        }

        this._keys = keys;
        this._vals = [...values.keys()];
    },

    _set: function(keyIndex, valueIndex) {
        const [wordIndex, bitIndex] = this._getIndex(keyIndex, valueIndex);
        this._bitmap[wordIndex] |= 1 << bitIndex;
    },

    _unset: function(keyIndex, valueIndex) {
        const [wordIndex, bitIndex] = this._getIndex(keyIndex, valueIndex);
        this._bitmap[wordIndex] &= ~(1 << bitIndex);
    },

    _isSet: function(keyIndex, valueIndex) {
        const [wordIndex, bitIndex] = this._getIndex(keyIndex, valueIndex);
        return (this._bitmap[wordIndex] & 1 << bitIndex) > 0;
    },

    _getIndex: function(keyIndex, valueIndex) {
        // find the logical index in the sequence of bits laid out in row major format
        // 0 1 2 3 ... maxValueCount-1
        // 0 1 2 3 ... maxValueCount-1
        // ...
        // is laid out as
        // 0 1 2 3 ... maxValueCount-1 0 1 2 3 ... maxValueCount-1 ...

        const logicalIndex = this._maxValueCount * keyIndex + valueIndex;

        // find the 32 bit word where the logical index falls, where only 31 bits in each are used
        const wordIndex = Math.floor(logicalIndex / 31);

        // inside the 32 bit word, map the bit to the bit going from the
        // order least significant bit to most significant bit
        // so that bitwise operation can be performed using 1 <<< X
        const bitIndex = 30 - logicalIndex % 31; // since only 31 bits are used

        return [wordIndex, bitIndex];
    },

    type: 'MembershipInMemoryCache'
};
