var AvailabilityCalculateAjax = Class.create();
AvailabilityCalculateAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    calculateAvailabilityForAll: function() {
        gs.eventQueue('spm.availability.calculate');
    },

    toString: function() {
        return 'AvailabilityCalculateAjax';
    }

});
