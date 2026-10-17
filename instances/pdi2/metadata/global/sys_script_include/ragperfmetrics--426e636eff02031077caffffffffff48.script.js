var RAGPerfMetrics = Class.create();
RAGPerfMetrics.prototype = {

    //@param {Object} logger  - GlideLogger instance
    initialize: function(logger, context) {
        this.logger = logger;
        this.context = context || 'RAGPerfMetrics';
        this.sections = {};
        this.order = [];
        this.globalStart = new Date().getTime();
    },

    startSection: function(name) {
        if (this.sections[name]) {
            this.logger.warn('[RAGPerfMetrics] Section already started: ' + name);
            return;
        }

        this.sections[name] = {
            start: new Date().getTime(),
            end: null
        };
        this.order.push(name);
    },

    endSection: function(name) {
        if (!this.sections[name]) {
            this.logger.warn('[RAGPerfMetrics] Section not found: ' + name);
            return;
        }
        if (this.sections[name].end) {
            this.logger.warn('[RAGPerfMetrics] Section already ended: ' + name);
            return;
        }
        this.sections[name].end = new Date().getTime();
    },

    getSectionDuration: function(name) {
        var section = this.sections[name];
        if (!section || !section.start || !section.end)
            return 'N/A';

        return section.end - section.start; //in milliseconds
    },

    getTotalDuration: function() {
        return new Date().getTime() - this.globalStart; //in milliseconds
    },

    summary: function(searchTerm) {
        var perfJson = {
            totalDurationMs: this.getTotalDuration(),
            sections: []
        };

        if (!gs.nil(searchTerm))
            perfJson.searchTerm = searchTerm;

        for (var i = 0; i < this.order.length; i++) {
            var name = this.order[i];
            perfJson.sections.push({
                step: i + 1,
                name: name,
                durationMs: this.getSectionDuration(name)
            });
        }

        return perfJson;
    },

    type: 'RAGPerfMetrics'
};
