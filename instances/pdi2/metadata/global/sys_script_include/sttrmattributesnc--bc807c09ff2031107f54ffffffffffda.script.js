var STTRMAttributeSNC = Class.create();
STTRMAttributeSNC.prototype = {
    initialize: function(attributeGrOrName, _gs) {
		// If we only have a name we can't do anything else
		if (typeof attributeGrOrName === "string") {
			this._attributeName = attributeGrOrName;
			return;
		}

		this._gs = _gs || gs;
		this._gr = attributeGrOrName;
		this._attributeName = attributeGrOrName.getValue("name");
		this._sysId = attributeGrOrName.getUniqueValue();
    },

	getName: function() {
		// If the GR has moved beneath an instance refresh the instance.
		if (this._gr && this._gr.getUniqueValue() !== this._sysId)
			this.initialize(this._gr);

		return this._attributeName;
	},

    type: 'STTRMAttributeSNC'
};
