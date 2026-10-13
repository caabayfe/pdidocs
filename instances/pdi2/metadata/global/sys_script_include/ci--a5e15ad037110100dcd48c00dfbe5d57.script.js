// Discovery
/**
 * Ci
 * CI record data inspection and mutation against the DB, including reconciliaton for referral and related Cis.
 * Provides an event handler for changes to the Ci, its network, or custom events.
 * Not thread-safe due to the way we handle walking through the network of Cis.
 *
 * Example:
 *   // create a new ci object. it may or may not exist in the db already.
 *   var ci = new Ci({table: 'cmdb_ci_foo_bar', indices: ['name']}, {
 *     name: 'item 01'
 *   };
 *
 *   ci.data.ip_address = '127.0.0.1'; // alter directly
 *
 *   // create a new CI that will have our original ci as a reference field, which can be reconciled
 *   var referralCi = new Ci('cmdb_ci_bar_foo', {
 *     foo: ci, // reference the parent ci
 *   });
 *
 *   referralCi.setIndices(['name']); // via method rather than through options constructor
 *   ci.addReferral(referralCi); // adds our referall ci to the ci.referrals array, reconciliaton now possible
 *   ci.write(); // insert/update the main ci along with ALL referrals
 *
 * Based on the the original CIData class.
 *
 * @since dublin
 * @author roy.laurie
 */

/**
 * Constructor formats: new Ci(options, data), new Ci(data)
 ** An example Ci options object:
 * var options = {
 *    table: string, // the table of this ci. same as ci.table.
 *    indices: [string field], // the unique fields used to read() this ci uniquely in a vacuum
 *    referrals: [ // defines the referral schema, one per table/reference field. See Ci.prototype.defineReferrals() for details.
 *        {   table: string,
 *            referenceField: string,
 *            write: boolean|undefined // whether this referral type should be included during write() (and reconcile)
 *            deleteMissing: boolean|undefined // delete missing CI records on reconcile. Default: true
 *            retireMissing: boolean|undefined, // if the CI is missing on reconcile, set its install status to ABSENT. Default: false
 *                                              // also, when true, ABSENT referrals will be set to INSTALLED when rediscovered.
 *        },
 *    ],
 *    relations: [ // defines the relation schema, one per table/nature. See Ci.prototype.defineRelations() for details
 *        {   table: string, // the (base) table to reconcile against
 *            nature: string, // the cmdb_rel_type.description
 *            isParent: boolean|undefined, // whether this CI is the parent (true|undefined) or child (false) in the relationship. Default: true
 *            write: boolean|undefined // whether this relation type should be included during write() (and reconcile)
 *            create: boolean|undefined // whether the relation record itself should be created. Default: true
 *            deleteMissing: boolean|undefined, // delete missing CI records on reconcile. Default: false
 *            retireMissing: boolean|undefined, // if the CI is missing on reconcile, set its install status to ABSENT. Default: false
 *            deleteMissingRelationships: boolean|undefined // delete the missing cmdb_rel_ci on reconcile. Default: true
 *        },
 *    ],
 *    listeners: [ // defines which event listeners apply to this Ci (and optionally, it's connections). See Ci.prototype.setListeners() for details
 *		{   name: string,
 *			eventTypes: [Ci.Event.Type]|Ci.Event.Type,
 *			callback: Function,
 *			filters: [Ci.Filter]|undefined
 *		},
 *	]
 * }
 **
 * @class Ci
 * @param {}|string|GlideRecord|undefined options Ci.Options object can be used rather than calling other setup methods. If string only, passes to ci.table.
 * @param {}|GlideRecord|undefined data Any initial primitive data to be assigned to this.data.
 */
var Ci = function(options, data) {
	/* @var {string field:string|int|float|boolean|Ci|null value} Ci.this.data For public mutation and insepection of record fields/values. */
	this.data = {};
	/* @var string Ci.this.table Table name of record */
	this.table = null;

	/* @var [string field] Ci.this._indices List of index fields to match on when determining record identity */
	this._indices = [];
	/* @var [Ci._Referral] Ci.this._referrals List of Cis that have a reference field that links to this specific Ci. */
	this._referrals = [];
	/* @var [Ci._Relation] Ci.this._relations List of Cis that have a (cmdb_rel_ci) child relationship with this Ci. */
	this._relations = [];
	/* @var [Ci._ReferralSchema] Ci.this._referralSchema Map of referring Ci record table -> reference field of referring Ci. */
	this._referralSchemas = [];
	/* @var [Ci._RelationSchema] this._relationSchema Map of related cmdb_ci table -> intended cmdb_rel_type description. */
	this._relationSchemas = [];
	this._affectedTimes = [];
	/* @var GlideRecord|null Ci.this._gr The cached glide record, if available. */
	this._gr = null;
	/* @var [Ci._Listener] The listeners registered against this Ci */
	this._listeners = [];
	/* @var {string key:string|int|boolean|float|Ci|null value} Ci.prototype._lastPublishedData A clone of Ci.this.data, made on each publish */
	this._lastPublishedData = null;

	// allow options to be skipped, and just data provided - swapping parameter palces.
	if (typeof data !== 'undefined') {
		if (data instanceof GlideRecord) { // read glide records
			if (!this.read(data))
				throw 'Unable to read CI: ' + data.getTableName() + ':' + data.sys_id;
		} else {
			this.data = data; // normal data
		}

		// options may either be a (string) table or a map of actual options
		if (typeof options === 'string') // then it's the table name
			this.table = options;
		else // then it's an options map, use the define method
			this.define(options);
	} else if (typeof options !== 'undefined') {
		if (options instanceof GlideRecord) {
			if (!this.read(options))
				throw 'Unable to read CI: ' + options.getTableName() + ':' + options.sys_id;
		} else {
			this.data = options;
		}
	}
};

/**
 * Describes how to select Cis in a given relational network of Cis.
 * @class Ci.Filter
 * @param Ci.Filter.Type|Ci.Filter type References, Relations, Referrals. May also be used as a single-param copy constructor.
 * @param int depth The depth at which to stop affecting connected Cis. 0: direct connections, 1: direct connections of this Ci's direct connections, etc.
 */
Ci.Filter = function(type, depth) {
	if (typeof type === 'undefined')
		throw 'Invalid Ci.Filter.Type passed to Ci.Filter: ' + type;

	if (type instanceof Ci.Filter) {
		this.type = type.type;
		this.depth = type.depth;
		return;
	}

	this.type = type;
	this.depth = ( typeof depth === 'undefined' ? Number.MAX_VALUE : depth );
	this.tables = null;
};

/**
 * The types of connections that a Ci can be affected by.
 */
Ci.Filter.Type = {
	/* Affects any references by this Ci to another */
	References: 'references',
	/* Affects any referrals from a Ci to this Ci */
	Referrals: 'referrals',
	/* Affects any relationships (cmdb_rel_ci) between a this Ci and another */
	Relations: 'relations'
};

/**
 * Determines whether the specified set of filters is viral or not.
 * @var Function Ci.Filter.viral
 * @param [Ci.Filter] filters
 */
Ci.Filter.viral = function(filters) {
	if (typeof filters === 'undefined')
		return false;
	if (Object.prototype.toString.call(filters) !== '[object Array]') // cast to eventTypes to an array // force to an array
		filters = [filters];

	for (var v = 0; v < filters.length; ++v) { // look for anything with depth available (gt0)
		if (filters[v].depth >= 0)
			return true;
	}

	return false;
};

/**
 * @var Ci.Filter.clone
 * @param [Ci.Filter]|undefined filters
 * @param {string key:string|boolean|integer value}|undefined mergeData Optionally merges fields after cloning each.
 */
Ci.Filter.clone = function(filters, mergeData) {
	if (typeof mergeData === 'undefined')
		mergeData = {};

	var clones = [];
	for (var i = 0; i < filters.length; ++i) {
		var clone = new Ci.Filter(filters[i]);

		// merge valid data, if any
		for (var key in mergeData) {
			switch(key) {
				case 'tables':
					clone.tables = mergeData.tables;
					break;
				default:
					throw 'Invalid key in Ci.Filter.clone(mergeData)';
			}
		}

		clones.push(clone);
	}

	return clones;
};

/**
 * An enum of common sets of filters. See Ci.Filter for more details.
 * @var {string name:[Ci.Filter] filters} Ci.Filters
 */
Ci.Filters = {
	/* Affects all associated Cis. */
	Global: [new Ci.Filter(Ci.Filter.Type.References), new Ci.Filter(Ci.Filter.Type.Referrals), new Ci.Filter(Ci.Filter.Type.Relations)],
	/* Affects only Cis associated by reference to a Ci or referral from a Ci. */
	Ref: [new Ci.Filter(Ci.Filter.Type.References), new Ci.Filter(Ci.Filter.Type.Referrals)],
	/* Affects all Cis that are directly associated to this Ci. */
	Direct: [new Ci.Filter(Ci.Filter.Type.References, 0), new Ci.Filter(Ci.Filter.Type.Referrals, 0), new Ci.Filter(Ci.Filter.Type.Relations, 0)],
	/* Affects only Cis that are directly associated to this Ci by referral to this Ci or reference from this Ci. */
	DirectRef: [new Ci.Filter(Ci.Filter.Type.References, 0), new Ci.Filter(Ci.Filter.Type.Referrals, 0)],
	/* Does not affect any other Cis */
	Local: []
};

/**
 * Passed to listeners from a Ci when an event occurs against it.
 *
 * @class Ci.Event
 * @param Ci.Event.Type eventType
 * @param Ci ci
 * @param {string key:string|bool|int|float|Ci|null value} data The data map to pass with the event. data.filters will affect range of event within this Ci's network.
 */
Ci.Event = function(type, ci, data) {
	this.type = type;
	this.ci = ci;
	this.filters = ( typeof data.filters === 'undefined' ? Ci.Filters.Local : filters ); // not supported yet

	if (typeof data !== 'undefined') {
		for (var key in data) {
			this[key] = data[key];
		}
	}
};

/**
 * An enum of out-of-box event types. Custom event types are supported as well. Use Ci.prototype.notify() to fire events.
 * @var {string name:string name} Ci.Event.Type
 */
Ci.Event.Type = {
	/* Notified solely by Ci.prototype.publish(), when the Ci.prototype.data object has inspected for changes. */
	OnDataChange: 'OnDataChange', // { original: {}, current: {}}
	/* Notified on Ci.prototype.addReferral(), when a new referral is about to be added to this Ci. */
	OnReferral: 'OnReferral', // { referralCi: Ci }
	/* Notified when a referral has been deleted during reconciliation. */
	OnReferralDelete: 'OnReferralDelete', // { referralCi: Ci }
	/* Notified when a referral was missing during reconciliation, regardless of action taken against it. */
	OnReferralMissing: 'OnReferralMissing', // { referralCi: Ci }
	/* Notified on Ci.prototype.addRelation(), when a new relation is about to be added to this Ci. */
	OnRelation: 'OnRelation', // { nature: nature of relationship, relationCi: Ci }
	/* Notified when a relation has been deleted during reconciliation */
	OnRelationDelete: 'OnRelationDelete', // { relationCi: Ci }
	/* NOtified when a relation was missing during reconciliaton, regardless of action taken against it */
	OnRelationMissing: 'OnRelationMissing' // { relationCi: Ci }
};

Ci.Event.typeIn = function(type, types) {
	for (var i = 0, n = types.length; i < n; ++i) {
		if (types[i] === type)
			return true;
	}

	return false;
};

/**
 * Describes a listener and its configuration.
 * @class Ci._Listener
 * @param string name The unique name to give to this listener - used to reference it in Ci.prototype.removeListener().
 * @param Ci.Event.Type eventType The type of event to listen for.
 * @param Function(Ci.Event) callback The callback to run against the event.
 * @param [Ci.Filter]|null|undefined filters The depth at which this listener should be spread to other Cis on the network. Default: Ci.Filters.Global
 */
Ci._Listener = function(name, eventTypes, callback, filters) {
	this.name = name;
	this.eventTypes = eventTypes;
	this.callback = callback;
	this.filters = ( typeof filters === 'undefined' || filters === null ? Ci.Filters.Global : filters );
};


/**
 * Describes a referral from another Ci.
 * @class Ci._Referral
 * @var Ci ci The CI that is making the reference to this Ci
 * @var Ci._ReferralSchema schema
 */
Ci._Referral = function(ci, schema) {
	/* @var Ci Ci._Referral.this.ci The CI that is making the reference to this Ci */
	this.ci = ci;
	this.schema = schema;
};

/**
 * Describes a relationship to another Ci.
 * @class Ci._Relation
 * @param Ci ci The cmdb_rel_ci.child
 * @param Ci._RelationSchema schema
 */
Ci._Relation = function(ci, schema) {
	this.ci = ci;
	this.schema = schema;
};

/**
 * Describes the schema for a given table/referenceField used in reconciliation.
 ** Example options object:
 * var options = {
 *     deleteMissing: boolean, // deletes CIs that were missing during reconcile. Default: true
 *     write: boolean, // If false, skips any write() (or reconcile) calls to the referral. Default: true
 * }
 **
 * @class Ci._ReferralSchema
 * @param string table
 * @param string referenceField
 * @param {string key:string|int|boolean value} options
 */
Ci._ReferralSchema = function(table, referenceField, options) {
	this.table = table;
	this.tables = Ci.getTableHeirarchy(table);
	this.referenceField = referenceField;

	if (typeof options === 'undefined')
		options = {};

	// options parsing
	this.deleteMissing = ( typeof options.deleteMissing === 'undefined' ? true : options.deleteMissing );
	this.retireMissing = ( typeof options.retireMissing === 'undefined' ? false : options.retireMissing );
	this.write = ( typeof options.write === 'undefined' ? true : options.write );
};

/**
 * Describes the schema for a relationship between this Ci and another, identified on table/nature.
 * @class Ci._RelationSchema
 * @param string table
 * @param string nature
 * @param boolean|undefined(true) isParent
 * @parem {string key:string|int|boolean value} options
 */
Ci._RelationSchema = function(table, nature, isParent, options) {
	this.table = table;
	this.nature = nature;
	this.isParent = ( typeof isParent === 'undefined' ? true : isParent );
	this.relationshipTypeId = Ci.getNatureId(nature);

	if (typeof options === 'undefined')
		options = {};

	// options parsing
	this.deleteMissing = ( typeof options.deleteMissing === 'undefined' ? false : options.deleteMissing );
	this.retireMissing = ( typeof options.retireMissing === 'undefined' ? false : options.retireMissing );
	this.deleteMissingRelationship = ( typeof options.deleteMissingRelationship === 'undefined' ? true : options.deleteMissingRelationship );
	this.write = ( typeof options.write === 'undefined' ? true : options.write );
	this.create = ( typeof options.create === 'undefined' ? this.write : options.create );
	this.reconcileExtended = options.reconcileExtended;
};

/**
 * Indices for Ci.prototype._affectedTimestamp
 * @var {string name:int index} Ci._Affected
 */
Ci._Affected = {
	WalkCallback: 0,
	Walk: 1,
	Write: 2,
	Reconcile: 3
};

/**
 * The event debug listener callback. Displays a shallow representation of the event.data map when Ci.prototype.notify()'d.
 * @var Function Ci._logEvent
 * @param Event event The event created by Ci.prototype.notify()
 */
Ci._logEvent = function(event) {
	// copy the event into a separate object, log, shorting any Ci objects to their toString() equivalents
	var log = {};
	for (var key in event) {
		if (typeof event[key] === 'object' && event[key] instanceof Ci) // show only a json list of indices/values for Ci objects
			log[key] = event[key].toString();
		else
			log[key] = event[key]; // primitive values only
	}

	Debug.logObject(event.type, log); // use the event type as the log key
};

Ci.CACHE_NATURE_ID = 'com.snc.discovery.Ci-nature-id';

/**
 * Retrieves the cmdb_rel_type.sys_id for the specified cmdb_rel_type.description.
 * Inexpensive as it uses glide caching.
 * @param string nature
 * @return string The sysid
 */
Ci.getNatureId = function(nature) {
	var id = GlideCacheManager.get(Ci.CACHE_NATURE_ID, nature);
	if (id !== null)
		return ''+id;

	var matches = nature.split('::');
	var parentDescriptor = matches[0];
	var childDescriptor = matches[1];

	var gr = new GlideRecord('cmdb_rel_type');
	gr.addQuery('parent_descriptor', parentDescriptor);
	gr.addQuery('child_descriptor', childDescriptor);
	gr.setLimit(1);
	gr.query();
	if (!gr.next())
		throw 'Unknown nature: ' + nature;

	id = ''+gr.sys_id;
	GlideCacheManager.put(Ci.CACHE_NATURE_ID, nature, id);
	return id;
};

/**
 * Returns a list of each ancestor table, in order, including the table itself.
 * @param string table
 */
Ci.getTableHeirarchy = function(table) {
	var tables = [];
	var tableList = GlideDBObjectManager.getTables(table);
	if (tableList === null)
		throw 'Table heirarchy could not be loaded: ' + table;

	for (var i = 0; i < tableList.size(); ++i)
	  tables.push(''+tableList.get(i));

	return tables;
};

/**
 * Returns whether the given table extends from the parent table.
 * @param string tableName: the name of the table to check
 * @param string parentTableName: the name of the parent table
 */
Ci.extendsFromTable = function(tableName, parentTableName) {
	var heirarchy = GlideDBObjectManager.getTables(tableName);
	return heirarchy.contains(parentTableName);
};

Ci.prototype = {
	define: function(options) {
		if (typeof options.table !== 'undefined')
			this.table = options.table;
		if (typeof options.indices !== 'undefined')
			this._indices = options.indices;
		if (typeof options.referrals !== 'undefined')
			this.defineReferrals(options.referrals);
		if (typeof options.relations !== 'undefined')
			this.defineRelations(options.relations);
		if (typeof options.listeners !== 'undefined')
			this.setListeners(options.listeners);
		if (typeof options.debug !== 'undefined' && options.debug !== false) { // value may be a list of filters (inherently, true)
			if (options.debug === true)
				this.debug(true);
			else
				this.debug(true, options.debug); // the value is an array of filters
		}
	},

	/**
	 * Adds a Ci object that refers to this CI, to be reconciled later.
	 * Any listeners within range (Ci.Filter) on either this Ci or the referral Ci will be registered on the other and its networked Cis, within its filter.
	 * Fires a Ci.Event.Type.OnReferral event.
	 * @var Function Ci.prototype.addReferral
	 * @param Ci ci The Ci referred from.
	 * @param string|undefined table The (base) table to reconcile the referred Ci against. Typically defined by Ci.prototype.defineReferral(). Default: ci.table
	 */
	addReferral: function(ci, table, referenceField) {
		// fire OnReferral event first, before bounds checking or anything.
		// other CIs may alter the schema to make them valid
		if (this.listening(Ci.Event.Type.OnReferral)) {
			this.notify(Ci.Event.Type.OnReferral, {
				referralCi: ci
			});
		}

		// bounds checking
		if (table === 'undefined' && ci.table === null)
			throw 'Ci.prototype.addReferral(): No explicit table provided and subject CI is invalid: ' + ci.toString();

		// scan the schemas first to determine if we have a match
		// if the table isn't specified, attempt to match against the Ci's parent tables, in order of extended class first
		var ciTables = ( typeof table === 'undefined' ? ci.getTableHeirarchy() : [table] );
		var referralSchema = null;
		for (var t = 0; t < ciTables.length; ++t) {
			var ciTable = ciTables[t];
			// search for this table in the schemas
			for (var i = 0; i < this._referralSchemas.length && referralSchema === null; ++i) {
				var schema = this._referralSchemas[i];
				if (schema.table !== ciTable)
					continue;

				// adopt the ref field from the schema, if not specified
				if (typeof referenceField === 'undefined') {
					referralSchema = schema;
				} else if (schema.referenceField === referenceField || referralSchema !== null) { // ref field specified or we already set it above in a previous iteration
					referralSchema = schema;
				}
			}
		}

		if (referralSchema === null) // no schema found, exception
			throw 'Referral from `' + ci + '` to `' + this + '` not valid based on Ci schema.';

		// check for dupes - add if not found
		for (var i = 0;i < this._referrals.length; ++i) {
			var referral = this._referrals[i];
			if (referral.ci === ci && referral.schema === referralSchema) // dupe found
				return; // nothing to do
		}

		this._referrals.push(new Ci._Referral(ci, referralSchema)); // add the referral
		ci.data[referralSchema.referenceField] = this; // add the ref on the specified ci, if not already done manually
		this._exchangeVirals(ci); // trade listeners, etc.
	},

	/**
	 * Adds a child relationship to this Ci.
	 * Fires a Ci.Event.Type.OnRelation event.
	 * @var Function Ci.prototype.addRelation
	 * @param Ci ci The cmdb_rel_ci.child Ci
	 * @param string|undefined table nature The cmdb_rel_type.description. Default: Uses relation schema (nature).
	 * @param string|undefined nature The (base) table to reconcile against. Default: Uses relation schema (table).
	 * @param boolean|undefined isChild Whether the ci is the child (TRUE) or parent (FALSE). Default: Uses relation schema (isParent).
	 * @throws Error If table/nature was not specified and no schema definition could be found
	 */
	addRelation: function(ci, table, nature, isChild) {
		// fire event first
		if (this.listening(Ci.Event.Type.OnRelation)) {
			this.notify(Ci.Event.Type.OnRelation, {
				relationCi: ci
			});
		}

		// scan the schemas first to determine if we have a match
		// if the table isn't specified, attempt to match against the Ci's parent tables, in order of extended class first
		var relationSchema = null;
		var ciTables = ( table ? [table] : ci.getTableHeirarchy() );
		for (var t = 0; t < ciTables.length; ++t) {
			var ciTable = ciTables[t];
			// search for this table in the schemas
			for (var i = 0; i < this._relationSchemas.length && relationSchema === null; ++i) {
				var schema = this._relationSchemas[i];
				if (schema.table !== ciTable)
					continue;

				// adpot the nature from the schema, if not specified
				if (typeof nature === 'undefined') {
					relationSchema = schema;
				} else if (schema.nature === nature || relationSchema !== null) { // nature specified or we already set it above in a previous iteration
					if (typeof isChild !== 'undefined') {
						if (schema.isParent === isChild) // schema should be parent, ci should be child - or vice versa
							relationSchema = schema;
					} else {
						relationSchema = schema;
					}
				}
			}
		}

		if (relationSchema === null) // schema not found, return
			return;

		//check for dupes, then add
		for (var i = 0; i < this._relations.length; ++i) {
			var relation = this._relations[i];
			if (relation.ci === ci && relation.schema === relationSchema) // dupe found
				return; // nothing to do
		}

		this._relations.push(new Ci._Relation(ci, relationSchema)); // add the new relation
		ci.addRelation(this, null, relationSchema.nature); // make a corresponding relationship on the specified ci
		this._exchangeVirals(ci); // trade listeners, etc.
	},

	/**
	 * Defines a schema for reconciling Cis related to this by the related Ci's table and the nature of the relationship (cmdb_rel_type.description)
	 * Will ignore dupes.
	 * @var Function Ci.prototype.defineRelation
	 * @param string table The related Ci's table
	 * @param string nature The CMDB Relation Type (description)
	 * @param boolean|undefined(true) isParent Whether this CI will be the parent (TRUE) or the child (FALSE)
	 * @param {string option:string|int|float|boolean value}|undefined options Schema options, mostly reconciliation.
	 */
	defineRelation: function(table, nature, isParent, options) {
		if (typeof isParent === 'undefined')
			isParent = true; // need this for dupe checking

		var relationSchema = new Ci._RelationSchema(table, nature, isParent, options);

		// attempt to find an existing schema of the same nature and table - overwite and return if found
		for (var i = 0; i < this._relationSchemas.length; ++i) {
			var schema = this._relationSchemas[i];
			if (schema.nature === nature && schema.table === table && schema.isParent === isParent)
				return;
		}

		this._relationSchemas.push(relationSchema); // not found, add
	},

	/**
	 * Defines relationship schemas for this Ci.
	 ** Example usage:
	 * ci.defineRelations([
	 *     {   table: 'cmdb_ci_computer',
	 *         nature: 'Consumes::Consumed by',
	 *         deleteMissing: true
	 *     },
	 *     {   table: 'cmdb_ci_application',
	 *         nature: 'Distributes::Distributed by',
	 *         isParent: false, // default true
	 *     }
	 * ]);
	 **
	 * @var Function Ci.prototype.defineRelations
	 * @param {string table:string nature} options
	 */
	defineRelations: function(options) {
		for (var i = 0; i < options.length; ++i) {
			var schema = options[i];
			this.defineRelation(schema.table, schema.nature, schema.isParent, schema);
		}
	},

	/**
	 * Describes how a referral should be reconciled against this Ci.
	 * @var Function Ci.prototype.defineReferral
	 * @param string table The (base) table to reconcile against
	 * @param string referenceField The table's field to reconcile this Ci against
	 */
	defineReferral: function(table, referenceField, options) {
		var referralSchema = new Ci._ReferralSchema(table, referenceField, options);
		// attempt to find an existing schema of the same nature and table - overwite and return if found
		for (var i = 0; i < this._referralSchemas.length; ++i) {
			var schema = this._referralSchemas[i];
			if (schema.table === table && schema.referenceField === referenceField) {
				this._referralSchemas[i] = referralSchema;
				return;
			}
		}

		this._referralSchemas.push(referralSchema); // not found, add
	},

	/**
	 * Describes the referral schemas for this Ci.
	 ** Example usage:
	 * ci.defineReferrals({
	 *     cmdb_ci_foo: 'owner',
	 *     cmdb_ci_bar: 'computer',
	 * });
	 **
	 * @param {string table:string referenceField} options
	 */
	defineReferrals: function(options) {
		for (var i = 0; i < options.length; ++i) {
			var schema = options[i];
			this.defineReferral(schema.table, schema.referenceField, schema);
		}
	},

	/**
	 * Enables or disables the debug logger listeners.
	 * @param bool enabled Enables / disables debugging.
	 * @param [Ci.Filter]|undefined filters By default, debugging will be enabled on all Cis connected to this one (Ci.Filters.Global). Change to limit range. Valid only when enabled.
	 */
	debug: function(enabled, filters) {
		var eventTypes = [];
		for (var eventType in Ci.Event.Type)
			eventTypes.push(eventType);

		if (enabled)
			this.listen('debug', eventTypes, filters, Ci._logEvent);
		else
			this.removeListener('debug', filters);
	},

	/**
	 * Determines whether this Ci has listeners for the given Ci.Event.Type.
	 * @var Function Ci.prototype.listening
	 * @param Ci.Event.Type eventType
	 */
	listening: function(eventType) {
		for (var i = 0; i < this._listeners.length; ++i) {
			var listener = this._listeners[i];
			if (Ci.Event.typeIn(eventType, listener.eventTypes)) {
				// scan each listener filter - if it has table restrictions, compare those to this.table
				for (var f = 0; f < listener.filters.length; ++f) {
					var filter = listener.filters[f];
					if (filter.tables !== null) { // filter further by table name
						for (var t = 0; t < filter.tables.length; ++i) {
							if (filter.tables[t] === this.table)
								return true;
						}
					} else {
						return true;
					}
				}
			}
		}

		return false;
	},

	/**
	 * Adds a new listener to this Ci. Will transfer to other connected Cis depending on filters.
	 * If an existing listener by the same name is found, we will skip the operation entirely.
	 * @var Function Ci.prototype.listen
	 * @param string name The globally unique name of this listener.
	 * @param [Ci.Event.Type]|Ci.Event.Type eventTypes The type of event to listen for
	 * @param [Ci.Filter]|Function(Ci.Event event)|undefined The range of Cis that this listener should affect.
	 *        Param used as 'callback' if undefined. Default: listener's filters, or Ci.Filters.Local if not found
	 * @param Function(Ci.Event event) callback The function called when the Event is fired
	 */
	listen: function(name, eventTypes, filters, callback) {
		if (Object.prototype.toString.call(eventTypes) !== '[object Array]') // cast to eventTypes to an array
			eventTypes = [eventTypes];
		if (typeof callback === 'undefined') { // if the last arg is skipped, assume 'filters' is the actual callback
			filters = null;
			callback = filters;
		}

		// attempt to find an existing listener by the same name - skip operation if we do
		for (var i = 0; i < this._listeners.length; ++i) {
			if (this._listeners[i].name === name)
				return;
		}

		 // initialize OnDataChange so that the next publish() call will be relative to this moment
		if (Ci.Event.typeIn(Ci.Event.Type.OnDataChange, eventTypes) && !this.listening(Ci.Event.Type.OnDataChange))
			this._lastPublishedData = this._cloneData(this.data);


		var listener = new Ci._Listener(name, eventTypes, callback, filters);
		this._listeners.push(listener);

		if (Ci.Filter.viral(filters))
			this.walk(filters, function(ci) { ci.listen(name, eventTypes, callback, filters); });
	},

	/**
	 * Adds listeners schema for this Ci.
	 ** Example usage:
	 * ci.setListeners([
	 *     {    name: 'fooListener',
	 *          eventTypes: Ci.Event.Type.OnReferral
	 *          callback: fooListener
	 *          filters: Ci.Filters.Global
	 *     },
	 *     {    name: 'barListener',
	 *          eventTypes: [Ci.Event.Type.OnRelation, Ci.Event.Type.OnReferral],
	 *          callback: barListener,
	 *          // filters default: Ci.Filters.Local
	 *     }
	 * ]);
	 **
	 * See Ci.prototype.listen() for details.
	 * @var Function Ci.prototype.
	 * @param [{name: string, eventTypes: [Ci.Event.Type]|Ci.Event.Type, callback: Function(Ci ci), filters: [Ci.Filter]|undefined}] options
	 */
	addListeners: function(options) {
		for (var i = 0; i < options.length; ++i) {
			var listenerOpt = options[i];
			this.listen(listenerOpt.name, listenerOpt.eventTypes, listenerOpt.callback, listenerOpt.filters);
		}
	},

	/**
	 * Removes a listener by name.
	 * @var Function Ci.prototype.removeListener
	 * @param string name
	 * @param [Ci.Viralitity]|undefined filters Affects the range of the removal within this Ci's network. Default: listener's filters or Ci.Filters.Local if not found
	 */
	removeListener: function(name, filters) {
		var wasListeningDataChange = this.listening(Ci.Event.Type.OnDataChange);
		// find the listener and delete it if we do
		var listener = null;
		for (var i = 0; i < this._listeners.length; ++i) {
			if (this._listeners[i].name === name) {
				listener = this._listeners[i];
				delete this._listeners[i];
				break;
			}
		}

		// reset the last publish data if we were listening to data changes but are no longer
		if (wasListeningDataChange && !this.listening(Ci.Event.Type.OnDataChange))
			this._lastPublishData = null;

		if (typeof filters === 'undefined' && listener !== null)
			filters = listener.filters;

		if (Ci.Filter.viral(filters))
			this.walk(filters, function(ci) { ci.removeListener(name, filters); });
	},

	/**
	 * Walks along the Cis connected to this, based on a set of filters (references, referrals, relations) and their
	 * depths. Performs a specified callback against each Ci found in the network of Cis.
	 *
	 * Use Ci.Filters.* for common options, or create your own. See Ci.Filter for details.
	 * @var Function Ci.prototype.walk
	 * @param [Ci.Filter] filters The set of Ci.Filter objects to filter the search by
	 * @param Function(Ci) callback The callback to perform for each Ci found.
	 */
	walk: function(filters, callback) {
		var timestamp = new Date().getTime();
		if (this._affect(Ci._Affected.Walk, timestamp)) {
			filters = Ci.Filter.clone(filters); // clone before a walk, so that we don't modify objects
			this._walk(filters, callback, timestamp);
		}
	},

	/**
	 * Performs the actual function of Ci.prototype.walk(), see that for details.
	 * Alters the depth of the provided filters.
	 * @var Function Ci.prototype._walk
	 * @param [Ci.Filter] filters The range that this walk will continue#mutable
	 * @param Function(ci) callback
	 * @param int affectedTime Used to prevent infinite loops.
	 */
	_walk: function(filters, callback, affectedTime) {
		var referredCis = null; // re-use this in both loops, lazy load
		// perform callback against directly connected Cis
		for (var v = 0; v < filters.length; ++v) {
			var filter = filters[v];
			if (filter.depth < 0) // past range
				continue;

			switch (filter.type) {
			case Ci.Filter.Type.References:
				referredCis = this.getReferredCis();
					for (var i = 0; i < referredCis.length; ++i) {
						if (referredCis[i]._affect(Ci._Affected.WalkCallback, affectedTime)) // proceed if we affected
							callback(referredCis[i]);
					}

				break;

			case Ci.Filter.Type.Referrals:
					for (var i = 0; i < this._referrals.length; ++i) {
						if (this._referrals[i].ci._affect(Ci._Affected.WalkCallback, affectedTime))
							callback(this._referrals[i].ci);
					}

				break;

			case Ci.Filter.Type.Relations:
				for (var i = 0; i < this._relations[i].length; ++i) {
					if (this._relations[i].ci._affect(Ci._Affected.WalkCallback, affectedTime))
						callback(this._relations[i].ci);
				}

				break;
			}

			--filter.depth; // decrement for the following walk()
		}

		// perform walk against directly connected cis
		for (var v = 0; v < filters.length; ++v) {
			if (filter.depth < 0) // depth has already been decremented once, otherwise this would be < 1
				continue;

			switch (filter.type) {
			case Ci.Filter.Type.References:
				for (var i = 0; i < referredCis.length; ++i) {
					if (referredCis[i]._affect(Ci._Affected.Walk, affectedTime))
						referredCis[i]._walk(filters, callback);
				}
				break;

			case Ci.Filter.Type.Referrals:
				for (var i = 0; i < this._referrals.length; ++i) {
					if (this._referrals[i].ci._affect(Ci._Affected.Walk, affectedTime))
						this._referrals[i].ci._walk(filters, callback);
				}
				break;

			case Ci.Filter.Type.Relations:
				for (var i = 0; i < this._relations[i].length; ++i) {
					if (this._relations[i].ci._affect(Ci._Affected.Walk, affectedTime))
						this._relations[i].ci._walk(filters, callback);
				}
				break;
			}
		}
	},

	/**
	 * Notifies all listeners registered on this Ci for the given event type. Creates a Ci.Event.
	 * @var Function Ci.prototype.notify
	 * @param Ci.Event.Type eventType
	 * @param {} data The event data to be passed to each listener. data.filters affects range.
	 */
	notify: function(eventType, data) {
		var event = ( typeof data === 'undefined' ? eventType : new Ci.Event(eventType, this, data) );
		// find each listener that is interested and call its callback
		for (var l = 0; l < this._listeners.length; ++l) {
			var listener = this._listeners[l];
			for (var i = 0; i < listener.eventTypes.length; ++i) {
				if (listener.eventTypes[i] === eventType) {
					listener.callback(event);
					break;
				}
			}
		}

		if (Ci.Filter.viral(data.filters))
			this.walk(data.filters, function(ci) { ci.notify(event); });
	},

	/**
	 * If listeners are registered to Ci.Event.OnDataChange: Determines if there have been any changes to the Ci.prototype.data
	 * object and notify()'s with an event if it has.
	 * @var Function Ci.prototype.publish
	 */
	publish: function() {
		if (!this.listening(Ci.Event.Type.OnDataChange)) // nobody cares, don't fire an event
			return;

		// create an object with only the diff'd data from the original version
		var diff = {};
		var current = {};
		var diffEmpty = true;
		for (var key in this.data) {
			if (this.data[key] !== this._lastPublishedData[key]) {
				diff[key] = ( typeof this._lastPublishedData[key] === 'undefined' ? null : this._lastPublishedData[key] );
				current[key] = ( typeof this.data[key] === 'undefined' ? null : this.data[key] );
				if (current[key] instanceof Ci)
					current[key] = current[key].toString();

				diffEmpty = false;
			}
		}

		if (diffEmpty) // then skip cloning the data over as well as firing an event
			return;

		this._lastPublishedData = this._cloneData(this.data); // clone data over for next call

		this.notify(Ci.Event.Type.OnDataChange, {
			original: diff,
			current: current
		});
	},

	/**
	 * Ensures that all fields are primitive values, reformatting them if necessary.
	 * Validates all referrals as well.
	 * @var Function Ci.prototype.validate
	 * @throws string If table does not exist.
	 */
	validate: function() {
		if (gs.nil(this.table))
			throw 'Ci.table not specified for CI';

		// This function previously ensured that no field had the value
		// 'undefined', throwing an exception if anything did have that value.
		// Throwing an exception that doesn't get caught isn't useful,
		// so I removed this code.
	},

	/**
	 * Queries the DB for either a match by indices or direct sys id.
	 * Populates values in to data.
	 * @var Function Ci.prototype.read
	 * @param GlideRecord|undefined Optional glide record to read from.
	 */
	read: function(gr) {
		if (typeof gr === 'undefined') {
			gr = this.getRecord();
			if (gr === null)
				return false;
		}

		var fields = gr.getFields();
		for (var i = 0; i < fields.size(); ++i) {
			var field = ''+fields.get(i).getName();
			var value = gr.getValue(field);
			if (!gs.nil(value))
				this.data[field] = ''+value;
		}

		this.table = ''+gr.getTableName();
		this.data.sys_id = ''+gr.sys_id;
		this.publish();
		return true;
	},

	/**
	 * Retrieves the GlideRecord for this Ci, based on sys_id or indicies. Caches the record for later use.
	 * @var Function Ci.prototype.getRecord
	 * @return GlideRecord
	 */
	getRecord: function() {
		if (this._gr !== null) // use lazy-loaded gr instance if available
			return this._gr;

		this.validate(); // ensure we're ready to read()

		var gr = new GlideRecord(this.searchTable || this.table);
		if (!gs.nil(this.data.sys_id)) { // use sys_id to match if available
			if (!this.data.sys_id || !gr.get('sys_id', this.data.sys_id))
				return null;

			// PRB1034997: Caching the GlideRecord can cause excessive memory usage
			// and doesn't seem to provide any performance benefit.
			//this._gr = gr;
			return gr;
		}

		// match values against index that we're configured for to determine identity
		for (var i = 0; i < this._indices.length; ++i) {
			var index = this._indices[i];
			var value = this.data[index];
			if (typeof value === 'undefined')
				return null;
			if (value instanceof Ci)
				value = value.data.sys_id;

			gr.addQuery(index, value);
		}

		gr.setLimit(1);
		gr.query();
		var id = ( gr.next() ? ''+gr.sys_id : null );
		gr = new GlideRecord(this.searchTable || this.table);
		if (id == null)
			return null;

		if (!gr.get(id)) // fetch the record directly
			throw 'Unable to get Ci: ' + id;

		// PRB1034997: Caching the GlideRecord can cause excessive memory usage
		// and doesn't seem to provide any performance benefit.
		//this._gr = gr;
		return gr;
	},

	/**
	 * Sets the index fields used to uniquely identify this Ci DB-wide
	 * @var Function Ci.prototype.setIndicies
	 * @param [string] indices
	 */
	setIndices: function(indices) {
		this._indices = indices;
	},


	/**
	 * Retrieves a list of Cis that this Ci currently references in its Ci.prototype.data object.
	 * @var Function Ci.prototype.getReferredCis
	 * @return [Ci]
	 */
	getReferredCis: function() {
		this.validate();
		var referredCis = [];
		for (var field in this.data) {
			if (this.data[field] instanceof Ci)
				referredCis.push(this.data[field]);
		}

		return referredCis;
	},

	/**
	 * Retrieves all Cis referred to this Ci, grouped by table name.
	 * @var Function Ci.prototype.getReferralsByTable
	 * @param string|undefined Optinoally filters which table to return for. Default: Table filter disabled
	 * @return {string table: Ci referrals}
	 */
	getReferralsByTable: function(table) {
		var singleTable = ( typeof table !== 'undefined' );
		var map = {}; // referral table -> referral ci
		if (singleTable)
			map[table] = [];

		for (var i = 0; i < this._referrals.length; ++i) {
			var referral = this._referrals[i];
			if (singleTable && referral.schema.table !== table)
				continue;
			if (typeof map[referral.schema.table] === 'undefined')
				map[referral.schema.table] = [];

			map[referral.schema.table].push(referral.ci);
		}

		return ( singleTable ? map[table] : map );
	},

	/**
	 * Returns a list of CIs for the given tables.
	 * @param string[]|undefined tables The tables to filter on. If undefined, returns all.
	 * @param string referenceField 
	 * @return Ci[]
	 */
	getReferrals: function(table, referenceField) {
		if (typeof table === 'undefined')
			table = null;

		var hasReferenceField = ( typeof referenceField !== 'undefined' );
		var cis = [];
		for (var i = 0; i < this._referrals.length; ++i) {
			var referral = this._referrals[i];

			if (hasReferenceField && referral.schema.referenceField !== referenceField)
				continue;
			
			if (table === null) // accept all
				cis.push(referral.ci);
			else if (JSUtil.contains(referral.schema.tables, table, true)) // schema table matches
				cis.push(referral.ci);
			else if (JSUtil.contains(Ci.getTableHeirarchy(referral.ci.table), table)) // actual ci table matches
				cis.push(referral.ci);
		}

		return cis;
	},

	/**
	 * Retrieve all Cis related to this Ci, grouped by table name.
	 * @var Function Ci.prototype.getRelationsByTable
	 * @param string|undefined Optinoally filters which table to return for. Default: Table filter disabled
	 * @return {string table: Ci referrals}
	 */
	getRelationsByTable: function(table) {
		var singleTable = ( typeof table !== 'undefined' );
		var map = {}; // referral table -> relation ci
		if (singleTable)
			map[table] = [];

		for (var i = 0; i < this._relations.length; ++i) {
			var relation = this._relations[i];
			if (singleTable && relation.schema.table !== table)
				continue;
			if (typeof map[relation.schema.table] === 'undefined')
				map[relation.schema.table] = [];

			map[relation.schema.table].push(relation.ci);
		}

		return ( singleTable ? map[table] : map );
	},
	
	/**
	 * Returns a JSON representation of this Ci including all references and relationships.
	 * @var Function Ci.prototype.toJson
	 * @param int timestamp Optional parameter that is used to check if a Ci has been walked already
	 * @return string
	 */
	toJson: function(timestamp) {
		var json = new JSON();
		var str = {
			table: this.table,
			referrals: [],
			relations: []
		};

		if (typeof this.data.sys_id !== 'undefined')
			str.sys_id = this.data.sys_id;

		var json = new JSON();
		for (var k = 0; k < this._indices.length; ++k) {
			var key = this._indices[k];
			var value = this.data[key];
			if (typeof value === 'undefined') {
				str[key] = '(undefined)';
			} else if (value === null) {
				str[key] = '(null)';
			} else if (value instanceof Ci) {
				var ci = this.data[key];
				var ciObj = {
					table: ci.table
				};

				if (typeof ci.data.sys_id !== 'undefined')
					ciObj.sys_id = ci.data.sys_id;

				for (var i = 0; i < ci._indices.length; ++i) {
					var index = ci._indices[i];
					if (typeof ci.data[index] === 'undefined')
						ciObj[index] = '(undefined)';
					else if (ci.data[index] === null)
						ciObj[index] = '(null)';
					else if (ci.data[index] instanceof Ci)
						ciObj[index] = { "Ci" : ci.data[index].table };
					else
						ciObj[index] = ci.data[index];
				}
				
				str[key] = ciObj;
			} else {
				str[key] = value;
			}
		}
		
		// Set a timestamp to make sure we don't end up in an infinite loop
		// subsequent recursive calls of toJson will use this timestamp
		// to make sure we aren't processing the same Ci
		if (gs.nil(timestamp))
			timestamp = new Date().getTime();
				
		for (var k = 0; k < this._referrals.length; ++k) {
   		 var ref = this._referrals[k].ci;
			if (ref._affect(Ci._Affected.Walk, timestamp))
				str['referrals'].push(ref.toJson(timestamp));
  	 }
		
		for (var k = 0; k < this._relations.length; ++k) {
			var rel = this._relations[k].ci;
			if (rel._affect(Ci._Affected.Walk, timestamp))
				str['relations'].push(rel.toJson(timestamp));
		}
		
		if (JSUtil.nil(str['referrals']))
			delete str['referrals'];
		
		if (JSUtil.nil(str['relations']))
			delete str['relations'];

		return str;
	},

	/**
	 * Returns a shallow JSON representation of this Ci's indices.
	 * @var Function Ci.prototype.toString
	 * @return string
	 */
	toString: function() {
		var str = {
			table: this.table
		};

		if (typeof this.data.sys_id !== 'undefined')
			str.sys_id = this.data.sys_id;

		var json = new JSON();
		for (var k = 0; k < this._indices.length; ++k) {
			var key = this._indices[k];
			var value = this.data[key];
			if (typeof value === 'undefined') {
				str[key] = '(undefined)';
			} else if (value === null) {
				str[key] = '(null)';
			} else if (typeof value == 'object') {
				if (value && value.ci)
					ci = value.ci;
				if (value instanceof Ci) {
					var ci = this.data[key];
					var ciObj = {
						table: ci.table
					};

					if (typeof ci.data.sys_id !== 'undefined')
						ciObj.sys_id = ci.data.sys_id;

					for (var i = 0; i < ci._indices.length; ++i) {
						var index = ci._indices[i];
						if (typeof ci.data[index] === 'undefined')
							ciObj[index] = '(undefined)';
						else if (ci.data[index] === null)
							ciObj[index] = '(null)';
						else if (ci.data[index] instanceof Ci)
							ciObj[index] = 'Ci { ' + ci.data[index].table + ' }';
						else
							ciObj[index] = ci.data[index];
					}

					var s = json.encode(ciObj)
					.replace(/"(\w+)"\:/g, "$1:") // trim quotes from things like "table": ...
					.replace(/"/g, '\''); // double quotes -> single quotes

					str[key] = 'Ci ' + s;
				} else {
					str[key] = value;
				}
			} else
				str[key] = value;
		}

		var s = json.encode(str)
		.replace(/"(\w+)"\:/g, "$1:")
		.replace(/"/g, '\'')
		.replace(/'(Ci \{.*?'\})'/g, '$1'); // don't quote nested Ci{} portions

		return 'Ci ' + s;
	},

	/**
	 * Returns a shallow object of the Ci.prototype.data and Ci.prototype.table.
	 * All Cis referenced are printed using Ci.prototype.toString()
	 * @var Function Ci.prototype.toShallowObj
	 * @return {}
	 */
	toShallowObj: function() {
		var obj = {
			table: this.table
		};

		for (var key in this.data) {
			var value = this.data[key];
			if (typeof value === 'undefined')
				obj[key] = undefined;
			else if (value instanceof Ci)
				obj[key] = value.toString();
			else
				obj[key] = value;
		}

		return obj;
	},

	/**
	 * Writes only this Ci object to the DB.
	 * @var Function Ci.prototype.update
	 * @param options Named parameters for this method.
	 ** Options parameters
	 * 'validate' (boolean): TRUE if validate() should be called (default).
	 **
	 */
	update: function(options) {
		if (typeof options === 'undefined' || typeof options.validate === 'undefined' || options.validate === true)
			this.validate();

		var gr = this.getRecord();
		if (gr === null)
			gr = new GlideRecord(this.table);

		if ((typeof this.searchTable == 'string') && ('' + gr.sys_class_name) && (this.table != ('' + gr.sys_class_name)))
			new DiscoveryFunctions().reclassify(gr, this.table);

		// update all fields
		for (var field in this.data) {
			// ignore auto-populated fields
			if (field === 'first_discovered' || field === 'start_date')
				continue;
			// Ignore fields that we don't have a value for.
			if (this.data[field] === undefined)
				continue;

			var refCi = this.data[field];
			if ((refCi != this) && (refCi instanceof Ci)) {
				if (gs.nil(refCi.data.sys_id)) {
					// if the referenced Ci is not dependent on any other Cis to update(), call it directly
					if (refCi._canUpdate()) {
						refCi.update();
					} else {
						Debug.logObject('Failed Updating CI', this.toShallowObj());
						Debug.logObject('Blocked On Referenced CI', refCi.toShallowObj());
						throw 'Ci.data.' + field + '.data.sys_id is invalid. Cannot reference on update()';
					}
				}

				gr.setValue(field, this.data[field].data.sys_id);
			} else if (gr.getValue(field) !== this.data[field]) {
				// sometimes we think setting the value is a harmless no-op, but something else 
				// has set the value correctly in the meantime. don't set the value unless we 
				// think we have a better value.
				gr.setValue(field, this.data[field]);
			}
		}

		gr.update();
		// PRB1034997: Caching the GlideRecord can cause excessive memory usage
		// and doesn't seem to provide any performance benefit.
		//this._gr = gr;
		this.data.sys_id = ''+gr.sys_id;
		this.publish();
	},

	_canUpdate: function() {
		for (var field in this.data) {
			if (this.data[field] && (this.data[field] instanceof Ci) && gs.nil(this.data[field].data.sys_id))
				return false;
		}

		return true;
	},

	/**
	 * Inserts/Updates for this Ci and all others in its network, reconciling relationships and referrals where defined.
	 * @var Function Ci.prototype.write
	 */
	write: function() {
		var affectedTime = new Date().getTime();

		if (this._affect(Ci._Affected.Write, affectedTime)) {
			// immediately update() any Ci that isn't dependent on another Ci
			this.walk(Ci.Filters.Global, function(ci) {
				if (ci._canUpdate())
					ci.update();
			});

			this._write(affectedTime);
		}

		if (this._affect(Ci._Affected.Reconcile, affectedTime))
			this._reconcile(affectedTime);
	},

	/**
	 * Writes the CIs to the DB as well as all referrals.
	 * Updates all CIs first, then reconciles them all, if necessary.
	 * @var Function Ci.prototype._write
	 * @param int writeTime
	 */
	_write: function(affectedTime) {
		var updated = false;

		this.validate();

		// update if we can
		if (this._canUpdate()) {
			this.update({ validate: false });
			updated = true;
		}

		// Step 1: first, write cis that we refer to, so that we have the necessary sysids
		var referredCis = this.getReferredCis();
		for (var i = 0; i < referredCis.length; ++i) {
			var refCi = referredCis[i];
			if (refCi._affect(Ci._Affected.Write, affectedTime))
				refCi._write(affectedTime);
		}

		// update this ci, if necessary
		if (!updated)
			this.update();

        // Step2: write cis that refer to this ci, now that we have a sysid on this ci
		// NOTE:  
		//  This function is recursive.
		//  At a given level of recursion, it is possible that the ci's that refer
		//  to this ci do NOT have their sys_id defined when refCi._write() called 
		//  and schema.isParent is false.
		//  The subsequent call to _createRelationships() function within this level
		//  of the recursive call shall therefore return without creating a relationship.  
		//  By the time the top level recursive write completes all ci's that refer to
		//  this ci shall exist (sys_id defined), ensuring that the relationship
		//  is created successfully.
		for (var i = 0; i < this._referrals.length; ++i) {
			var refCi = this._referrals[i].ci;
			var schema = this._referrals[i].schema;
			if (schema.write && refCi._affect(Ci._Affected.Write, affectedTime))
				refCi._write(affectedTime);
		}

		// Step3: write related cis
		for (var i = 0; i < this._relations.length; ++i) {
			var relationCi = this._relations[i].ci;
			var schema = this._relations[i].schema;
			if (schema.write && relationCi._affect(Ci._Affected.Write, affectedTime))
				relationCi._write(affectedTime);
		}

		// Step4: Create [cmdb_rel_ci] when both Parent and Child ci records exist
		this._createRelationships();
	},

	_createRelationships: function() {
		// create a relationship record, if it doesn't exist already, for each relation
		for (var i = 0; i < this._relations.length; ++i) {
			var relation = this._relations[i];
			var schema = relation.schema;

			if (!schema.create)
				continue;

			// create a relationship if one does not exist
			var relGr = new GlideRecord('cmdb_rel_ci');
			relGr.addQuery('type', schema.relationshipTypeId);
			
			var parent;
			var child;

			if (schema.isParent) {
				parent = this.data.sys_id;
				child = relation.ci.data.sys_id;
			} else {
				child = this.data.sys_id;
				parent = relation.ci.data.sys_id;
			}

			// skip invalid relationships
			if (JSUtil.nil(parent) || JSUtil.nil(child))
				continue;

			relGr.addQuery('parent', parent);
			relGr.addQuery('child', child);			
	
			// skip if there is a relationship already
			relGr.setLimit(1);
			relGr.query();
			if (relGr.next())
				continue;

			// we don't have a relationship, create one
			relGr = new GlideRecord('cmdb_rel_ci');
			relGr.setValue('type', schema.relationshipTypeId);
			if (schema.isParent) {
				relGr.setValue('parent', this.data.sys_id);
				relGr.setValue('child', relation.ci.data.sys_id);
			} else {
				relGr.setValue('parent', relation.ci.data.sys_id);
				relGr.setValue('child', this.data.sys_id);
			}

			relGr.insert();
		}
	},


	/**
	 * Reconciles referrals and relations.
	 * @var Function Ci.prototype._reconcile
	 */
	_reconcile: function(affectedTime) {
		// reconcile for references
		var referredCis = this.getReferredCis();
		for (var i = 0; i < referredCis.length; ++i) {
			var refCi = referredCis[i];
			if (refCi._affect(Ci._Affected.Reconcile, affectedTime))
				refCi._reconcile(affectedTime);
		}

		// reconcile for referrals
		for (var i = 0; i < this._referrals.length; ++i) {
			var refCi = this._referrals[i].ci;
			var schema = this._referrals[i].schema;
			if (schema.write && refCi._affect(Ci._Affected.Reconcile, affectedTime))
				refCi._reconcile(affectedTime);
		}

		// reconcile for relations
		for (var i = 0; i < this._relations.length; ++i) {
			var relationCi = this._relations[i].ci;
			var schema = this._relations[i].schema;
			if (schema.write && relationCi._affect(Ci._Affected.Reconcile, affectedTime))
				relationCi._reconcile(affectedTime);
		}

		this._reconcileReferrals();
		this._reconcileRelations();
	},

	/**
	 * Reconciles referred CIs by unique key sets.
	 * @var Function Ci.prototype._reconfileReferrals
	 */
	_reconcileReferrals: function() {
		var listeningDelete = this.listening(Ci.Event.Type.OnReferralDelete);
		var listeningMissing = this.listening(Ci.Event.Type.OnReferralMissing);

		for (var s = 0; s < this._referralSchemas.length; ++s) {
			var referralSchema = this._referralSchemas[s];
			if (!referralSchema.write)
				continue;

			var table = referralSchema.table;
			var referrals = this.getReferrals(table);

			// iterate through all current referrals in db
			var tableGr = new GlideRecord(table);
			tableGr.addQuery(referralSchema.referenceField, this.data.sys_id);
			tableGr.query();
			while(tableGr.next()) {
				// find the corresponding Ci in our new dataset
				var referralCi = null;
				for (var r = 0; r < referrals.length && referralCi === null; ++r) {
					var ci = referrals[r];
					referralCi = ci;

					// match on indices
					for (var i = 0; i < ci._indices.length; ++i) {
						var index = ci._indices[i];
						var grVal = ''+tableGr.getValue(index);
						var ciVal = ci.data[index];

						// use the sysID for Ci objects
						if (ciVal instanceof Ci)
							ciVal = ciVal.data.sys_id;
						
						// Convert ciVal to a string in the case that it was not a number. The conversion is not 
						// applied for the numbers because for number x,  x == 'x.0'  but 'x' != 'x.0'.
						// Fixes null != 'null'. 
						if (typeof ciVal != 'number')
								ciVal = '' + ciVal;

						// reset the referralCi variable if the values don't match
						if (ciVal != grVal) {
							referralCi = null;
							break;
						}
					}
				}

				// referrral not found in new dataset. delete this record to reconcile.
				if (referralCi === null) {
					var missingCi = null;
					if (listeningDelete || listeningMissing) {
						missingCi = new Ci(tableGr); // for notifies later on
					}

					if (listeningMissing) {
						this.notify(Ci.Event.Type.OnReferralMissing, {
							referralCi: missingCi
						});
					}

					if (referralSchema.deleteMissing) {
						tableGr.deleteRecord();

						if (listeningDelete) {
							this.notify(Ci.Event.Type.OnReferralDelete, {
								referralCi: missingCi
							});
						}
					} else if (referralSchema.retireMissing) {
						tableGr.install_status = 100;
						tableGr.update();
					}

					continue;
				}
				
				// if the schema is set to mark missing as ABSENT, reverse it if we rediscover a referral
				if (referralSchema.retireMissing && tableGr.install_status == 100) {
					tableGr.install_status = 1;
					tableGr.update();
				}

				referralCi.data.sys_id = ''+tableGr.sys_id; // set the sysid now that we've found it
			}
		}
	},

	/**
	 * @var Function Ci.prototype._reconcileRelations
	 */
	_reconcileRelations: function() {
		var relatedToType, gr;
		var listeningMissing = this.listening(Ci.Event.Type.OnRelationMissing);
		var listeningDelete = this.listening(Ci.Event.Type.OnRelationDelete);

		// for each relationship schema definition, reconcile all referral cis of that schema
		for (var s = 0; s < this._relationSchemas.length; ++s) {
			var schema = this._relationSchemas[s];
			if (!schema.write) // skip this schema
				continue;

			// query for all CIs currently related to this Ci, by the same nature/role
			var relatedGr = new GlideRecord('cmdb_rel_ci');
			relatedGr.addQuery('type', schema.relationshipTypeId);
			if (schema.isParent) {
				relatedGr.addQuery('parent', this.data.sys_id);
				if (!schema.reconcileExtended)
					relatedGr.addQuery('child.sys_class_name', schema.table);
				relatedToType = 'child';
			} else {
				relatedGr.addQuery('child', this.data.sys_id);
				if (!schema.reconcileExtended)
					relatedGr.addQuery('parent.sys_class_name', schema.table);
				relatedToType = 'parent';
			}

			relatedGr.query();
			grLoop: while (relatedGr.next()) {
				if (schema.reconcileExtended) {
					gr = new GlideRecord(relatedGr[relatedToType].sys_class_name);
					if (!gr.instanceOf(schema.table))
						continue;
				}
				// find each ci for this schema and attempt to match it to the query result
				// delete any results which we can't find a match for
				for (var r = 0; r < this._relations.length; ++r) {
					var relation = this._relations[r];
					if (relation.schema !== schema) // not current schema, skip
						continue;

					if (schema.isParent) {
						if ((''+relatedGr.child.sys_id) === relation.ci.data.sys_id) // we found a match, next
							continue grLoop;
					} else { // schema is child
						if ((''+relatedGr.parent.sys_id) === relation.ci.data.sys_id) // we found a match, next
							continue grLoop;
					}
				}

				// if we're here, it means that this gr has no match. determine whether we delete it or not by schema config
				var missingCi = new Ci(( schema.isParent ? relatedGr.child : relatedGr.parent ));
				if (schema.deleteMissing) {
					relatedGr.child.deleteRecord();
					relatedGr.deleteRecord();

					if (listeningDelete) {
						this.notify(Ci.Event.Type.OnRelationDelete, {
							relationCi: missingCi
						});
					}
				} else {
					if (schema.deleteMissingRelationship)
						relatedGr.deleteRecord();
					if (schema.retireMissing) {
						missingCi.data.install_status = 100;
						missingCi.write();
					}
				}

				if (listeningMissing) {
					this.notify(Ci.Event.Type.OnRelationMissing, {
						relationCi: missingCi
					});
				}
			}
		}
	},

	/**
	 * Retrieves a list of table names that this Ci's table extends from, in order.
	 * @return string[]
	 */
	getTableHeirarchy: function() {
		return Ci.getTableHeirarchy(this.table);
	},

	/**
	 * Determines whether this Ci's table is the same as or extends from the specified parent tabe.
	 * @return boolean TRUE if extends, FALSE if not.
	 */
	extendsFromTable: function(parentTable) {
		var heirarchy = this.getTableHeirarchy();
		return JSUtil.contains(heirarchy, parentTable);
	},

	/**
	 * Determines whether the specified Ci._Affect type has been registered against the specified timestamp.
	 * If not registered, it will register the time and return TRUE. Otherwise, it will ignore and return FALSE.
	 * @var Function Ci.prototype._affect
	 * @param Ci._Affected type
	 * @param int timestamp
	 * @returns TRUE if the type is newly affected, FALSE if it has already been.
	 */
	_affect: function(type, timestamp) {
		if (typeof this._affectedTimes[type] === 'undefined' || this._affectedTimes[type] !== timestamp) {
			this._affectedTimes[type] = timestamp;
			return true;
		}

		return false;
	},


	/**
	 * Performs a simple clone of Ci.prototype.data objects.
	 * @var Function Ci.prototype._cloneData
	 * @param {} source
	 * @return {}
	 */
	_cloneData: function(source) {
		var data = {};
		for (var key in source) {
			data[key] = source[key];
		}

		return data;
	},

	/**
	 * Exchanges viral data (listeners) between this Ci and the specified, extending through the network.
	 * @var Function Ci.prototype._exchangeVirals
	 * @param Ci ci
	 * @param boolean halfDuplex Call the specified Ci's _exchangeVirals against this afterwards.
	 */
	_exchangeVirals: function(ci, halfDuplex) {
		// transfer listeners from this ci to target
		for (var l = 0; l < this._listeners.length; ++l) {
			var listener = this._listeners[l];
			if (Ci.Filter.viral(listener.filters))
				ci.listen(listener.name, listener.eventTypes, listener.filters, listener.callback);
		}

		if (typeof halfDuplex === 'undefined')
			ci._exchangeVirals(this, true);
	},
	
	/**
	 * Set all non-system fields(field names do not start with sys_) in data part to undefined. This function 
	 * is used to track the fields that were modified by the code which creates the Ci. It is possible that 
	 * the data that we have when we create the Ci was different from the data that we have in DB when we 
	 * want to write the Ci in DB. We need some ways to identify which fields are modified in the same code and try 
	 * to prevent over-write the fields that we didn't work on them.
	 */
	setDataUndefined: function() {
		for (var field in this.data) {
			if (this.data[field] instanceof Ci)
				continue;
			if (field.startsWith('sys_'))
				continue;
			this.data[field] = undefined;
		}
	}
};
