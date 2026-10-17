var CmdbWalkerProvider = Class.create();
CmdbWalkerProvider.prototype = {
    /**
     * @param {string[]} ciSysIds
     * @param {number} maxCiCount - 0 for no limit
     * @throws {Error}
     */
    initialize: function(ciSysIds, maxCiCount) {
        this.walker = this._createWalker(ciSysIds, maxCiCount);
    },

    /**
     * @param {string[]} relTypes
     * @param {boolean} reverse
     * @param {number} maxDepth
     * @returns {boolean} - true if after walking max depth there are no more rels to follow, false otherwise
     */
    walk: function(relTypes, reverse, maxDepth) {
        try{
            return this.walker.walk(this._getRelTypesStrings(relTypes), reverse, maxDepth);
        } catch (e) {
            gs.error(`[CmdbWalkerProvider.walk] ${e}`);
            return false;
        }
    },

    /**
     * @private
     * @param {string} expectedCiType - Empty string for all relations
     * @param {boolean} reverse
     * @returns {RelationJson[]}
     */
	getRelations: function(expectedCiType, reverse) {
		try {
			const javaRelationJsonList = this.walker.getRelations(expectedCiType, reverse);
			const relationJsonList = [];
			for (let i = 0; i < javaRelationJsonList.size(); i++) {
				const relationJson = String(javaRelationJsonList.get(i));
				relationJsonList.push(JSON.parse(relationJson));
			}
			return relationJsonList;
		} catch (e) {
			gs.error(`[CmdbWalkerProvider.getRelations] ${e}`);
			return [];
		}
	},

    /**
     * @private
     * @param {string[]} ciSysIds
     * @param {number} maxCiCount
     * @returns {Object} SNC.CmdbWalker
     * @throws {Error}
     */
    _createWalker: function(ciSysIds, maxCiCount) {
        if (!SNC || !SNC.CmdbWalker) {
            throw new Error('SNC.CmdbWalker is not available in this scope.');
        }
        return new SNC.CmdbWalker(ciSysIds, maxCiCount);
    },

	/**
	 * @private
	 * @param {string[]} relTypes
	 * @returns {string}
	 */
	_getRelTypesStrings: function(relTypes) {
		return relTypes.map(relType => String(relType));
	},

    type: 'CmdbWalkerProvider'
};

//#region type definitions
/**
 * @typedef {Object} RelationJson
 * @property {string} parent
 * @property {string} sys_id
 * @property {string} child_class_name
 * @property {string} type
 * @property {string} child
 */
//#endregion
