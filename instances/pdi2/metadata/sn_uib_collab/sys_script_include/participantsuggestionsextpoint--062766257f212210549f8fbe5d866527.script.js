var ParticipantSuggestionsExtPoint = Class.create();
ParticipantSuggestionsExtPoint.prototype = Object.extendsObject(ParticipantSuggestionsExtPointSNC, {
    initialize: function() {
        ParticipantSuggestionsExtPointSNC.prototype.initialize.call(this);
    },

    type: 'ParticipantSuggestionsExtPoint'
});
