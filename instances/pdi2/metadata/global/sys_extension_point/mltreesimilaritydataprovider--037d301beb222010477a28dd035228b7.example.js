var MLTreeSimilarityDataProvider = Class.create();
//Create an implementation of this extension point in an application scope
MLTreeSimilarityDataProvider.prototype = {
    initialize: function(parameters) {
        //Parameters configured by sn_ml.TreeSimilarityTrainer api for
        //the trainer server to use while invoking this data provider
        this.parameters = parameters;
    },

    /* Provide json tree structured data in one or more of the following ways
     * writer.write("string value");
     * var stream = new GlideSysAttachment().getContentStream(yourAttachmentId);
     * writer.write(stream);
     * return yourAttachmentId; */
    getData: function( /*stream writer*/ writer) {
        writer.write("{");
        //construct and write the tree json

        writer.write("}");
    },

    type: 'MLTreeSimilarityDataProvider'
};
