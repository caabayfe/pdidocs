var VariantSelector = Class.create();
VariantSelector.prototype = {
    initialize: function() {},

    /**
     * Selects a variant from the provided array based on stickiness percentage
     * @param {Array<VariantDto>} variants - Array of VariantDto objects representing available variants
     * @param {UserStickness} stickiness - stickiness object with getPercentage() method that returns a value between 0.0 and 1.0
     * @returns {VariantDto|null} Selected VariantDto based on stickiness percentage, or null if no variant matches
     */
    select: function(variants, stickiness) {
        this._sortByTimeStamp(variants);
        this._calculateRanges(variants);

        // Get normalized hash from stickiness
        var normalizedHash = stickiness.getPercentage();

        // Find variant whose bounds include the normalized hash value
        for (var i = 0; i < variants.length; i++) {
            if (normalizedHash >= variants[i].getLowerBound() && normalizedHash < variants[i].getUpperBound()) {
                return variants[i];
            }
        }
        return null;

    },

    _sortByTimeStamp: function(variants) {
        // Sort in ascending order (oldest to newest)
        variants.sort(function(a, b) {
            if (a.getCreateTimestamp().after(b.getCreateTimestamp())) { // If 'a' is after 'b'
                return 1;
            }
            if (a.getCreateTimestamp().before(b.getCreateTimestamp())) { // If 'a' is before 'b'
                return -1;
            }
            // Tie-break by sys_id for deterministic ordering
            var aId = a.getVariantId();
            var bId = b.getVariantId();
            if (aId < bId) return -1;
            if (aId > bId) return 1;
            return 0;
        });
    },

    _calculateRanges: function(variants) {
        var cumulativePercentage = 0.0;
        var sumOfPercentage = 0.0;
        // Calculate total percentage sum
        for (var i = 0; i < variants.length; i++) {
            var variantPercentage = variants[i].getPercentage();
            sumOfPercentage += variantPercentage;
        }
        // Calculate bounds for each variant
        for (var j = 0; j < variants.length; j++) {
            var variant = variants[j];
            variantPercentage = variant.getPercentage();

            // Set lower bound
            variant.setLowerBound(cumulativePercentage);

            // Calculate normalized percentage and update cumulative
            var normalizedPercentage = variantPercentage / sumOfPercentage;
            cumulativePercentage += normalizedPercentage;

            // Set upper bound
            variant.setUpperBound(cumulativePercentage);
        }

    },


    type: 'VariantSelector'
};
