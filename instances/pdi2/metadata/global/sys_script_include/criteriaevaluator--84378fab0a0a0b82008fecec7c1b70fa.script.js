// Discovery class
gs.include("PrototypeServer");

/**
 * Implements a general-purpose criteria evaluator.  The general use pattern is to construct the class, add as many criteria as needed,
 * then evaluate.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var CriteriaEvaluator = Class.create();

CriteriaEvaluator.prototype = {
    initialize: function() {
        this.criteria = [];
    },
    
    /*
     * The left hand comparand (lh_comparand) is a string that must be a named value in the left hand values input into
     * evaluate().  The operator must be one of the following strings:
     *     equals
     *     starts with
     *     contains
     *     does not contain
     *     ends with
     *     regex matches
     * The right hand comparand (rh_comparand) is a string that can be evaluated either as one of the right hand values input
     * into evaluate(), or (if it's not in those values) as a literal string.
     */
    addCriterion: function(lh_comparand, operator, rh_comparand) {
        var criterion = {};
        criterion['lh'] = lh_comparand;
        criterion['op'] = operator;
        criterion['rh'] = rh_comparand;
        this.criteria.push(criterion);
    },
    
    /*
     * The left hand values (lh_values) are a hashmap of name/value pairs that will be used to evaluate the left hand comparands
     * of the criteria.  The right hand values (rh_values) are optional, and will be used instead of the literal value in evaluating
     * the right hand comparands.  The any value is a boolean, true if any criterion matching suffices for a true result, or false if all 
     * criteria must match for a true result.
     * 
     * The result is false unless the supplied values satisfy the criteria.
     */
    evaluate: function(lh_values, rh_values, any) {
        for (var i = 0; i < this.criteria.length; i++) {
            var criterion = this.criteria[i];
            var lhval = lh_values[criterion.lh];
            if (!lhval && any)
                continue;
            if (!lhval && !any)
                return false;
            var rhval;
            if (rh_values)
                rhval = rh_values[criterion.rh];
            if (!rhval)
                rhval = criterion.rh;
            var result = false;
            
            // make sure our comparison is case-insensitive...
            lhval = lhval.toLowerCase();
            rhval = rhval.toLowerCase();
            
            switch(criterion.op) {
                case 'equals':
                    result = (lhval == rhval);
                    break;
                case 'starts with':
                    result = (lhval.indexOf(rhval) == 0);
                    break;
                case 'contains':
                    result = (lhval.indexOf(rhval) >= 0);
                    break;
                case 'does not contain':
                    result = (lhval.indexOf(rhval) < 0);
                    break;
                case 'ends with':
                    var m = lhval.match(new RegExp('^.*' + rhval + '$', ''));
                    result = (m != null);
                    break;
                case 'regex matches':
                    var m = lhval.match(new RegExp(rhval, ''));
                    result = (m != null);
                    break;
                default:
                    if (any)
                        continue;
                    else 
                        return false;
                    break;                
            }
            if (result && any) return true;
            if (!result && !any) return false;
        }
        return !any;
    },
    
    size: function() {
        return this.criteria.length;
    },
    
    type: 'CriteriaEvaluator'
}
