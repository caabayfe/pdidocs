var SegmentDao = Class.create();
SegmentDao.prototype = {
    initialize: function() {
        this.TABLE_NAME = "sn_experiment_core_segment";
    },

    getSegmentBySysId: function(sysId) {
        if (!sysId) {
            gs.warn("SegmentDao.getSegmentBySysId: sysId is required");
            return null;
        }

        var gr = new GlideRecord(this.TABLE_NAME);
        if (gr.get(sysId)) {
            return Segment.fromGlideRecord(gr);
        }
        return null;
    },

    getSegmentByName: function(name) {
        if (!name) {
            gs.warn("SegmentDao.getSegmentByName: name is required");
            return null;
        }

        var gr = new GlideRecord(this.TABLE_NAME);
        gr.addQuery("name", name);
        gr.query();

        if (gr.next()) {
            return new Segment.fromGlideRecord(gr);
        }
        return null;
    },

    saveSegment: function(segment) {
        if (!segment || typeof segment !== "object") {
            gs.error("SegmentDao.saveSegment: Valid Segment object is required");
            return null;
        }

        try {
            var gr = new GlideRecord(this.TABLE_NAME);
            var sysId = segment.getSysId();
            var isUpdate = gr.get(sysId);

            if (!isUpdate) {
                gr.initialize();
                if (sysId) gr.setNewGuidValue(sysId);
            }

            gr.setValue("name", segment.getName());
            gr.setValue("criteria", JSON.stringify(segment.getCriteria()));

            var savedSysId = gr.update();
            return savedSysId || gr.getUniqueValue();
        } catch (error) {
            gs.error("SegmentDao.saveSegment: " + error.message);
            return null;
        }
    },

    type: "SegmentDao"
};
