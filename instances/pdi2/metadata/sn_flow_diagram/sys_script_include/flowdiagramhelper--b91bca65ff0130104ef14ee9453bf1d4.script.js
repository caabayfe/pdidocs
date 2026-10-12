var FlowDiagramHelper = Class.create();
FlowDiagramHelper.prototype = {
    initialize: function() {},

    type: 'FlowDiagramHelper'
};

var UUID_LENGTH = 36;
var FIRST_DASH = 8;
var SECOND_DASH = 13;
var THIRD_DASH = 18;
var FOURTH_DASH = 23;

FlowDiagramHelper.isValidUuid = function(uuid) {
    return uuid &&
        uuid.length === UUID_LENGTH &&
        uuid.charAt(FIRST_DASH) === '-' &&
        uuid.charAt(SECOND_DASH) === '-' &&
        uuid.charAt(THIRD_DASH) === '-' &&
        uuid.charAt(FOURTH_DASH) === '-';
};

FlowDiagramHelper.reverseUuid = function(uuid) {
    var newUuid = uuid;
    if (FlowDiagramHelper.isValidUuid(newUuid)) {
        newUuid = FlowDiagramHelper.removeUiUniqueIdentifierDashes(newUuid);
        newUuid = newUuid.split('').reverse().join('');
        newUuid = FlowDiagramHelper.addUiUniqueIdentifierDashes(newUuid);
        return newUuid;
    } else {
        return FlowDiagramHelper.addUiUniqueIdentifierDashes(sn_flow.FlowDesigner.getGeneratedGuid());
    }
};

// should only process 0-9, a-f characters (hexadecimal)
FlowDiagramHelper.addOneToFirstLastHexadecimal = function(str) {
    if (str && str.length >= 2) {
        var first = str.substring(0, 1);
        var last = str.substring(str.length - 1);
        str = FlowDiagramHelper.addOneToHexadecimal(first) + str.substring(1, str.length - 1) + FlowDiagramHelper.addOneToHexadecimal(last);
    }
    return str;
};

// should only process 0-9, a-f characters (hexadecimal)
FlowDiagramHelper.addOneToHexadecimal = function(str) {
    var newStr;
    if (str === 'f') {
        newStr = '0';
    } else if (str === '9') {
        newStr = 'a';
    } else {
        newStr = String.fromCharCode(str.charCodeAt(0) + 1);
    }
    return newStr;
};

// Adds char codes of a string to a hex
FlowDiagramHelper.addStringToUuid = function(str, uuid) {
    if (typeof str !== 'string') {
        throw 'Invalid string given to addStringToUuid: ' + str;
    }
    if (!FlowDiagramHelper.isValidUuid(uuid)) {
        throw 'Invalid uuid given to addStringToUuid: ' + uuid;
    }

    // Create char codes based on our 'key' str
    var charCodeStr = '';
    for (var i = 0; i < str.length; i++) {
        charCodeStr += str.charCodeAt(i);
    }
    var charCodeInt = parseInt(charCodeStr);

    // Get the last eight of the old uuid
    var uuidWithoutDashes = FlowDiagramHelper.removeUiUniqueIdentifierDashes(uuid);
    var lastEightUuid = uuidWithoutDashes.substring(uuidWithoutDashes.length - 8, uuidWithoutDashes.length);
    lastEightUuid = parseInt(lastEightUuid, 16);

    // Add the last eight of the old uuid to the char codes we made earlier
    var newUuid = (charCodeInt + lastEightUuid).toString(16);
    if (newUuid.length > uuidWithoutDashes.length) {
        newUuid = newUuid.substring(0, uuidWithoutDashes.length);
    }

    // Create a new uuid, injecting the new uuid into the old uuid
    newUuid = uuidWithoutDashes.substring(0, uuidWithoutDashes.length - newUuid.length) + newUuid;

    // Make sure to add in dashes again before returning
    return FlowDiagramHelper.addUiUniqueIdentifierDashes(newUuid);
};

// sort the array "d" by "order" value 
// this sort supports arrayPosition value with dots (e.g. 1.2.33)
// sortByArrayPosition(array); // sort by asc
// sortByArrayPosition(array "desc"); sort by desc
FlowDiagramHelper.sortByArrayPosition = function(d, order) {
    var sort = {
            asc: function(a, b) {
                var l = 0,
                    m = Math.min(a.value.length, b.value.length);
                while (l < m && a.value[l] === b.value[l]) {
                    l++;
                }
                return l === m ? a.value.length - b.value.length : a.value[l] - b.value[l];
            },
            desc: function(a, b) {
                return sort.asc(b, a);
            }
        },

        // temporary array holds objects with position and sort-value
        mapped = d.map(function(el, i) {
            return {
                index: i,
                value: el.arrayPosition.toString().split('.').map(Number)
            };
        });

    // sorting the mapped array containing the reduced values
    mapped.sort(sort[order] || sort.asc);

    // container for the resulting order
    return mapped.map(function(el) {
        return d[el.index];
    });
};

FlowDiagramHelper.sortByDepth = function(d, depth) {
    var sort = {
            asc: function(a, b) {
                var l = 0,
                    m = Math.min(a.value.length, b.value.length);
                while (l < m && a.value[l] === b.value[l]) {
                    l++;
                }
                return l === m ? a.value.length - b.value.length : a.value[l] - b.value[l];
            },
            desc: function(a, b) {
                return sort.asc(b, a);
            }
        },

        // temporary array holds objects with position and sort-value
        mapped = d.map(function(el, i) {
            return {
                index: i,
                value: el.depth.toString().split('.').map(Number)
            };
        });

    // sorting the mapped array containing the reduced values
    mapped.sort(sort[depth] || sort.asc);

    // container for the resulting order
    return mapped.map(function(el) {
        return d[el.index];
    });
};

FlowDiagramHelper.sortByCustomOrder = function(d, order) {
    var sort = {
            asc: function(a, b) {
                var l = 0,
                    m = Math.min(a.value.length, b.value.length);
                while (l < m && a.value[l] === b.value[l]) {
                    l++;
                }
                return l === m ? a.value.length - b.value.length : a.value[l] - b.value[l];
            },
            desc: function(a, b) {
                return sort.asc(b, a);
            }
        },

        // temporary array holds objects with position and sort-value
        mapped = d.map(function(el, i) {
            return {
                index: i,
                value: el.customOrder.toString().split('.').map(Number)
            };
        });

    // sorting the mapped array containing the reduced values
    mapped.sort(sort[order] || sort.asc);

    // container for the resulting order
    return mapped.map(function(el) {
        return d[el.index];
    });
};

FlowDiagramHelper.hasProperty = function(object, key) {
    if (object && typeof object === "object" && key !== undefined && key !== null && Object.prototype.hasOwnProperty.call(object, key)) {
        return true;
    }
    return false;
};

// removes dashes from str (should be uuid formatted)
FlowDiagramHelper.removeUiUniqueIdentifierDashes = function(str) {
    var newUuid = str;
    if (typeof newUuid === 'string') {
        newUuid = newUuid.split('');
        newUuid.splice(FOURTH_DASH, 1);
        newUuid.splice(THIRD_DASH, 1);
        newUuid.splice(SECOND_DASH, 1);
        newUuid.splice(FIRST_DASH, 1);
        newUuid = newUuid.join('');
    }

    return newUuid;
};

// inserts dashes to str (should be uuid formatted)
FlowDiagramHelper.addUiUniqueIdentifierDashes = function(str) {
    str = FlowDiagramHelper.insertNewStringAtIndex(str, 20, "-");
    str = FlowDiagramHelper.insertNewStringAtIndex(str, 16, "-");
    str = FlowDiagramHelper.insertNewStringAtIndex(str, 12, "-");
    str = FlowDiagramHelper.insertNewStringAtIndex(str, 8, "-");
    return str;
};

FlowDiagramHelper.insertNewStringAtIndex = function(existing, i, insert) {
    if (i >= 0 && i < existing.length)
        return existing.slice(0, i) + insert + existing.slice(i);
    else
        return existing;
};

FlowDiagramHelper.obtainTriggerInstances = function(triggerInstancesJson) {
    var triggerInstances = [];
    for (var i = 0; i < triggerInstancesJson.length; i++) {
        var triggerInstance = triggerInstancesJson[i];
        var instanceInputs = [];
        var instanceOutputs = [];

        for (var inputI = 0; inputI < triggerInstance.inputs.length; inputI++) {
            var input = triggerInstance.inputs[inputI];
            instanceInputs.push({
                value: input.value,
                label: input.label,
                name: input.name
            });
        }

        for (var outputI = 0; outputI < triggerInstance.outputs.length; outputI++) {
            var output = triggerInstance.outputs[outputI];
            instanceOutputs.push({
                type: output.type,
                label: output.label,
                name: output.name
            });
        }

        triggerInstances.push({
            name: triggerInstance.name,
            triggerInstanceId: triggerInstance.id,
            triggerType: triggerInstance.type,
            inputs: instanceInputs,
            outputs: instanceOutputs
        });
    }

    return triggerInstances;
};

/**
 * Generate node name for Flow logic
 */
FlowDiagramHelper.generateFlowLogicNodeName = function(instance) {
    var name = instance.name;

    if (instance.flowLogicDefinition && instance.flowLogicDefinition.name) {
        name = instance.flowLogicDefinition.name;

        if (instance.flowLogicDefinition.type === 'DOUNTIL') {
            name = FlowDiagramConstants.NODE_NAMES.DO_FOLLOWING;
        } else if (instance.data) {
            name = FlowDiagramHelper.generateNameWithCondition(name, instance.data);
        }
    }


    return name;
};


/**
 * Generate node name with condition info for flow logics
 */
FlowDiagramHelper.generateNameWithCondition = function(name, conditionData) {
    var nameWithCondition = name;

    if (conditionData) {
        var conditionValue = conditionData.condition_name;
        nameWithCondition = name + (conditionValue ? ': ' + conditionValue : '');
    }


    return nameWithCondition;
};

/**
 * Generate node name for action, subflow, flowlogic
 */
FlowDiagramHelper.generateNodeName = function(instance) {

    switch (_getType(instance)) {
        case 'action':
            return instance.name ? instance.name : (instance.actionType.fName || instance.actionType.name);

        case 'subflow':
            return instance.name ? instance.name : instance.subFlow.name;

        case 'flowlogic':
            return FlowDiagramHelper.generateFlowLogicNodeName(instance);

        default:
            return instance.name || '';
    }

    function _getType(instance) {
        if (instance.actionType) return 'action';
        if (instance.subFlow) return 'subflow';
        if (instance.flowLogicDefinition) return 'flowlogic';

        return '';
    }
};

var GOBACKTO_FROM_LABEL_PREFIX = "Back from ";
var GOBACKTO_LABEL_DELIM = ", ";
FlowDiagramHelper.addAndSortLabelOrders = function(label, newOrder) {
    if (!label) {
        return "";
    }
    var ordersStr = label.split(GOBACKTO_FROM_LABEL_PREFIX)[1];
    if (!ordersStr) {
        return label;
    }
    var orderArr = ordersStr.split(GOBACKTO_LABEL_DELIM);
    if (newOrder) {
        orderArr.push(newOrder);
    }
    return orderArr.sort(function(a, b) {
        var intA = JSON.parse(a);
        var intB = JSON.parse(b);
        if (intA > intB) return 1;
        if (intA < intB) return -1;
        return 0;
    }).join(GOBACKTO_LABEL_DELIM);
};

FlowDiagramHelper.getGoBackToLabel = function(key, order, currentLabel) {
    if (key && typeof order === "number") {
        if (currentLabel) {
            var orders = FlowDiagramHelper.addAndSortLabelOrders(currentLabel, order);
            return GOBACKTO_FROM_LABEL_PREFIX + orders;
        }
        return GOBACKTO_FROM_LABEL_PREFIX + order;
    }
    return "";
};
