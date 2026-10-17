var CMDBWsDMCertificationAttributeStatusDto = Class.create();
CMDBWsDMCertificationAttributeStatusDto.prototype = Object.extendsObject(CMDBWsDMConstants, {
    initialize: function (name) {
        this.name = name;
    },

    //Start: Properties to expose
    name: "",
    status: "pending",
    originalVal: "",
    certifiedVal: "",
    comment: "",
    //End: Properties to expose

    populate: function (attributeStatusObj) {
        this.setName(attributeStatusObj.name);
        this.setStatus(attributeStatusObj.status);
        this.setCertifiedValue(attributeStatusObj.certifiedVal);
        this.setOriginalVal(attributeStatusObj.originalVal);
        this.setComment(attributeStatusObj.comment);
    },

    setName: function (name) {
        this.name = name;
    },

    setOriginalVal: function (originalVal) {
        this.originalVal = gs.nil(originalVal) ? "" : originalVal;
    },

    setStatus: function (status) {
        this.status = status;
    },

    setCertifiedValue: function (certifiedVal) {
        this.certifiedVal = gs.nil(certifiedVal) ? "" : certifiedVal;
    },

    setComment: function (comment) {
        this.comment = gs.nil(comment) ? "" : comment;
    },

    isPending: function () {
        return !this.status || this.status == this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.PENDING;
    },

    isCertified: function () {
        return this.status == this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.CERTIFIED;
    },

    isFailed: function () {
        return this.status == this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.FAILED;
    },

    type: 'CMDBWsDMCertificationAttributeStatusDto'
});
