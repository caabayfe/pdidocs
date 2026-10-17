var TableAclClassifier = Class.create();
TableAclClassifier.prototype = {
    TABLE_TYPE_TASK: 'te',
    TABLE_TYPE_NON_TASK: 'nt',

    ACL_NOOP: 'n',
    ACL_UNRESTRICTED: 'u',
    ACL_RESTRICTED: 'r',
    ACL_USER_RESTRICTED: 'ur',
    ACL_APPROVER_RESTRICTED: 'a',
    ACL_UNKNOWN: 'ukn',

    initialize: function(aclScopeLevels) {
        // TODO FIX cross referenced constants
        this.ACL_TASK_EXTENTION_NO_CONDITION = this.ACL_UNRESTRICTED + this.TABLE_TYPE_TASK;
        this.ACL_NON_TASK_EXTENTION_NO_CONDITION = this.ACL_UNRESTRICTED + this.TABLE_TYPE_NON_TASK;
        this.ACL_TASK_EXTENTION_WITH_CONDITION = this.ACL_RESTRICTED + this.TABLE_TYPE_TASK;
        this.ACL_NON_TASK_EXTENTION_WITH_CONDITION = this.ACL_RESTRICTED + this.TABLE_TYPE_NON_TASK;
        this.ACL_TASK_EXTENTION_WITH_APPROVER_CONDITION = this.ACL_APPROVER_RESTRICTED + this.TABLE_TYPE_TASK;
        this.ACL_TASK_EXTENTION_WITH_UNKNOWN = this.ACL_UNKNOWN + this.TABLE_TYPE_TASK;
        this.ACL_NON_TASK_EXTENTION_WITH_UNKNOWN = this.ACL_UNKNOWN + this.TABLE_TYPE_NON_TASK;
        this.ACL_TASK_EXTENTION_WITH_NOOP = this.ACL_NOOP + this.TABLE_TYPE_TASK;
        this.ACL_NON_TASK_EXTENTION_WITH_NOOP = this.ACL_NOOP + this.TABLE_TYPE_NON_TASK;
        this.ACL_NON_TASK_EXTENTION_WITH_APPROVER_CONDITION = this.ACL_APPROVER_RESTRICTED + this.TABLE_TYPE_NON_TASK;
        this.ACL_TASK_EXTENTION_WITH_USER_CONDITION = this.ACL_USER_RESTRICTED + this.TABLE_TYPE_TASK;
        this.ACL_NON_TASK_EXTENTION_WITH_USER_CONDITION = this.ACL_USER_RESTRICTED + this.TABLE_TYPE_NON_TASK;

        var tableClasses = [
            this.ACL_TASK_EXTENTION_NO_CONDITION,
            this.ACL_NON_TASK_EXTENTION_NO_CONDITION,
            this.ACL_TASK_EXTENTION_WITH_CONDITION,
            this.ACL_NON_TASK_EXTENTION_WITH_CONDITION,
            this.ACL_TASK_EXTENTION_WITH_APPROVER_CONDITION,
            this.ACL_NON_TASK_EXTENTION_WITH_APPROVER_CONDITION,
            this.ACL_TASK_EXTENTION_WITH_USER_CONDITION,
            this.ACL_NON_TASK_EXTENTION_WITH_USER_CONDITION,
            this.ACL_TASK_EXTENTION_WITH_UNKNOWN,
            this.ACL_NON_TASK_EXTENTION_WITH_UNKNOWN,
            this.ACL_TASK_EXTENTION_WITH_NOOP,
            this.ACL_NON_TASK_EXTENTION_WITH_NOOP
        ];

        this.aclsPerClass = {};
        for (var i = 0; i < aclScopeLevels.length; ++i) {
            this.aclsPerClass[aclScopeLevels[i]] = {};
            for (var j = 0; j < tableClasses.length; ++j) {
                this.aclsPerClass[aclScopeLevels[i]][tableClasses[j]] = this._initACLCounts();
                this.aclsPerClass[aclScopeLevels[i]].total = 0;
            }
        }
    },

    getTableType: function(tableInfo) {
        if (tableInfo.isTaskExt)
            return this.TABLE_TYPE_TASK;

        return this.TABLE_TYPE_NON_TASK;
    },

    add: function(asl, aclType, op, tableType, count) {
        this._addTo(this.aclsPerClass, asl, aclType, op, tableType, count);
    },
    
    addAll: function(aclTypes, importantOps, tableType, aclCounts) {
        this._addAllTo(this.aclsPerClass, aclTypes, importantOps, tableType, aclCounts);
    },

    getAclsPerClass: function() {
        return this.aclsPerClass;
    },

    _addTo: function(aclsPerClass, asl, aclType, op, tableType, count) {
        var tableClass = this._getTableClass(aclType, tableType);
        aclsPerClass[asl][tableClass][op] += count;
        aclsPerClass[asl][tableClass].total += count;
        aclsPerClass[asl].total += count;
    },

    _addAllTo: function(aclsPerClass, aclTypes, importantOps, tableType, aclCounts) {
        for (var a in aclTypes) {
            var aclType = aclTypes[a];
            for (var o in importantOps) {
                for (var asl in aclsPerClass) {
                    this._addTo(aclsPerClass, asl, aclType, importantOps[o], tableType, aclCounts[asl][aclType][importantOps[o]]);
                }
            }
        }
    },

    _getTableClass: function(aclType, tableType) {
        return aclType + tableType;
    },

    _initACLCounts: function () {
        return {
            'total': 0,
            'write': 0,
            'read': 0,
            'commentWrite': 0
        }; // , 'skip': {'write': 0}, 'delete': 0 // removed delete form important ops;
    },


    type: 'TableAclClassifier'
};
