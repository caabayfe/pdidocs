var SoCLandingModelBuilderSNC = Class.create();
		SoCLandingModelBuilderSNC.prototype = Object.extendsObject(SoC, {
			initialize: function(_gs) {
				SoC.prototype.initialize.call(this, null, _gs);

				this.defCache = {};
				this.profileCache = {};
			},

			initialHit: function(orderBy, textSearch) {
				var model = {
					"__struct": {
						"all": { // Example structure for all/pinned/owned __struct components
							"sysIds": [],  // sys_ids of records in provided order
							"__more": false // true if there are more records
						}
					},
					"chg_soc_definition": {},
					"__profile": {}
				};

				var startAt = 0;
				var socDefGr = SoCDefinition.findAll(orderBy, textSearch);
				model.__struct.all = this.buildComponent(socDefGr, startAt, SoC.LANDING_LIMIT, model.__profile, model.chg_soc_definition);

				socDefGr = SoCDefinition.findOwned(orderBy, textSearch);
				model.__struct.own_belong = this.buildComponent(socDefGr, startAt, SoC.LANDING_LIMIT, model.__profile, model.chg_soc_definition);

				socDefGr = SoCDefinition.findPinned(orderBy, textSearch);
				model.__struct.pinned = this.buildComponent(socDefGr, startAt, SoC.LANDING_LIMIT, model.__profile, model.chg_soc_definition);

				model.chg_soc_definition = this.defCache;
				model.__profile = this.profileCache;
				return model;
			},

			_getSocDefGr: function(filter, orderBy, textSearch) {
				var socDefGr;
				if (filter === SoC.PINNED)
					socDefGr = SoCDefinition.findPinned(orderBy, textSearch);
				else if (filter === SoC.OWN_BELONG)
					socDefGr = SoCDefinition.findOwned(orderBy, textSearch);
				else
					socDefGr = SoCDefinition.findAll(orderBy, textSearch);
				return socDefGr;
			},

			getDefinitions: function(startAt, limit, filter, orderBy, textSearch) {
				if (!orderBy)
					orderBy = SoC.NAME;

				if (!limit || isNaN(limit) || limit < SoC.LANDING_MIN_LIMIT)
					limit = SoC.LANDING_MIN_LIMIT;

				if (!startAt || isNaN(startAt))
					startAt = 0;

				var socDefGr = this._getSocDefGr(filter, orderBy, textSearch);

				var socDef = new SoCDefinition(socDefGr, this._gs);
				var model = {
					chg_soc_definition : [],
					__profile: {},
					__more: false
				};

				var offset = 0;
				while (offset < startAt) {
					socDefGr.next();
					offset++;
				}
				limit = (SoC.LANDING_MAX_SCHEDULES - offset) < limit ? SoC.LANDING_MAX_SCHEDULES - offset : limit;
				var counter = 0;
				while (socDefGr.next()) {
					if (counter === SoC.LANDING_MAX_SCHEDULES) {
						model.__more = false;
						break;
					}
					if (limit === counter) {
						model.__more = socDefGr.hasNext();
						break;
					}

					model[SoC.DEFINITION].push(socDef.toJS());
					if (!socDefGr.owner.nil() && !model.__profile[socDefGr.owner + ""])
						model.__profile[socDefGr.owner + ""] = new global.ChangeSoCUtil().getUserProfile(socDefGr.owner + "");
					counter++;
				}

				return model;
			},

			buildComponent: function(socDefGr, startAt, limit) {
				if (!startAt)
					startAt = 0;
				if (!limit || isNaN(limit) || limit < SoC.LANDING_MIN_LIMIT)
					limit = SoC.LANDING_MIN_LIMIT;

				limit = limit > SoC.LANDING_MAX_SCHEDULES ? SoC.LANDING_MAX_SCHEDULES : limit;
				var socDef = new SoCDefinition(socDefGr, this._gs);

				var struct = {
					sysIds: [],
					__more: false,
					limit: parseInt(limit),
					maxLimit: SoC.LANDING_MAX_SCHEDULES,
					offset: 0
				};

				var counter = 0;
				while (socDefGr.next()) {
					if (counter === SoC.LANDING_MAX_SCHEDULES) {
						struct.__more = false;
						break;
					}
					if (parseInt(limit) === counter) {
						struct.__more = socDefGr.hasNext();
						break;
					}

					var sysId = socDefGr.getUniqueValue();

					// Cache the definition in case it's used in more than one place
					if (!this.defCache[sysId])
						this.defCache[sysId] = socDef.toJS();

					// Cache the profile in case it's used in more than one place
					if (!socDefGr.owner.nil() && !this.profileCache[socDefGr.owner + ""])
						this.profileCache[socDefGr.owner + ""] = new global.ChangeSoCUtil().getUserProfile(socDefGr.owner + "");

					struct.sysIds.push(sysId);
					counter++;
				}

				return struct;
			},

			type: 'SoCLandingModelBuilderSNC'
		});
