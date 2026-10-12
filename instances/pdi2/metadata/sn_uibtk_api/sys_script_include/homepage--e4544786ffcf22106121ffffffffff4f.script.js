var Homepage = Class.create();
Homepage.prototype = {
    initialize: function(noDomain) {
        const user = gs.getUser();
        this.HANDLERS = {
            EXPERIENCE: new Experience('path,title,sys_scope,sys_updated_on,sys_id'.split(','), noDomain, true),
            COMPONENT: new Macroponent('description,name,sys_scope,sys_updated_on,sys_id'.split(','), true),
            PC: new ExtensionPoint('name,description,sys_scope,sys_updated_on,sys_id'.split(','), noDomain, true),
            CONTROLLER: new Controller('name,description,sys_scope,sys_updated_on,sys_id'.split(',')),
            PRESET: new ComponentPreset('name,description,sys_scope,sys_updated_on,sys_id'.split(','), false)
        };
        this.isMaint = gs.hasRole('maint');
        this.favorites = JSON.parse(user.getPreference('uib.favorites') ?? "[]");
    },
    getBaseObject: function(key) {
        const route = BuilderToolkitConstants.HOMEPAGE.ROUTE[key];
        const isPC = route === BuilderToolkitConstants.HOMEPAGE.ROUTE.PC;
        const isComponent = route === BuilderToolkitConstants.HOMEPAGE.ROUTE.COMPONENT;

        return {
            sublabel: BuilderToolkitConstants.HOMEPAGE.TRANSLATED[key],
            icon: BuilderToolkitConstants.HOMEPAGE.IMAGES[key],
            route: route,
            fieldName: isPC ? `extensionpointId` : `${route}${isComponent ? 'SysId' : 'Id'}`,
            className: isPC ? 'pageCollection' : route
        };
    },
    getEncodedQuery(key) {
        const encodedQuery = [];
        if (!this.isMaint) {
            encodedQuery.push('sys_scope.private=false');
        }
        if (BuilderToolkitConstants.HOMEPAGE.QUERIES[key]) {
            encodedQuery.push(BuilderToolkitConstants.HOMEPAGE.QUERIES[key]);
        }
        return encodedQuery.join('^');
    },
    getRecords: function(key) {
        const returnData = [];

        const isExperience = key === BuilderToolkitConstants.HOMEPAGE.ROUTE.EXPERIENCE.toUpperCase();
        const isComponent = key === BuilderToolkitConstants.HOMEPAGE.ROUTE.COMPONENT.toUpperCase();
        const encodedQuery = this.getEncodedQuery(key);
        const orderBy = isExperience ? 'title' : isComponent ? 'label' : 'name';

        const baseObject = this.getBaseObject(key);

        const recordsGR = BuilderToolkitAPIBase.prototype.getRecordsByQuery.call(this.HANDLERS[key], encodedQuery, orderBy, true);
        while (recordsGR && recordsGR.next()) {
            const id = recordsGR.getUniqueValue();
            const data = {
                ...baseObject,
                label: isExperience ? recordsGR.title.getDisplayValue() : recordsGR.name.getDisplayValue(),
                scope: recordsGR.sys_scope.getDisplayValue().replace('@', ''),
                updated: recordsGR.sys_updated_on.getDisplayValue(),
                id,
                fields: {
                    [baseObject.fieldName]: id
                },
                params: {},
                isFavorite: this.favorites.some((favorite) => {
                    return favorite.id === id;
                })
            };

            if (isExperience) {
                data.path = recordsGR.path.getDisplayValue();
            } else {
                data.description = recordsGR.description.getDisplayValue();
            }
            returnData.push(data);
        }
        return returnData;
    },
    getAllItemsFlat: function(allItemsByClass) {
        let result = [];
        for (const key in allItemsByClass) {
            if (Array.isArray(allItemsByClass[key])) {
                result = result.concat(allItemsByClass[key]);
            }
        }
        return result;
    },
    //fetch is a favorite and tag those that are
    get: function() {
        const that = this;
        const allItemsByClass = Object.keys(this.HANDLERS).reduce((acc, key) => {
            const isPC = key === 'PC';
            const className = isPC ? 'pageCollection' : BuilderToolkitConstants.HOMEPAGE.ROUTE[key];
            acc[className] = that.getRecords(key);
            return acc;
        }, {});
        return {
            allItemsByClass,
            allItems: this.getAllItemsFlat(allItemsByClass)
        };
    },

    type: 'Homepage'
};
