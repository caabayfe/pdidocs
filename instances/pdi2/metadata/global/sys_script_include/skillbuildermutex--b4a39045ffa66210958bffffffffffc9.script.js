var SkillBuilderMutex = Class.create();
SkillBuilderMutex.prototype = {
    initialize: function(name, spinWait = 10, maxSpins = 0) {
        this.mutex = new GlideSelfCleaningMutex(name, 'skill_builder');
        this.mutex.setMaxSpins(maxSpins);
        this.mutex.setSpinWait(spinWait);
    },

    get: function() {
        return this.mutex.get();
    },

    release: function() {
        this.mutex.release();
    },

    type: 'SkillBuilderMutex'
};
