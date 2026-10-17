var CAPayloadSizeCalculator = Class.create();
CAPayloadSizeCalculator.prototype = {
    initialize: function() {},

    //returns the byte length of an UTF8 String
    checkSize: function(payload) {
        if (gs.nil(payload) || gs.nil(payload.length))
            return;

        var payloadLength = payload.length;
		// loop through each char to see if it requires more bytes
        for (var count = 0; count < payloadLength; count++) {
            var charCode = payload.charCodeAt(count);
            if (charCode > 0x7f && charCode <= 0x7ff) payloadLength++;
            else if (charCode > 0x7ff && charCode <= 0xffff) payloadLength += 2;
            else if (charCode > 0xffff && charCode <= 0x10ffff) payloadLength += 3;
        }

        return payloadLength;
    },

    type: 'CAPayloadSizeCalculator'
};
