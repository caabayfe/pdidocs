(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    if (!gs || !sn_tourbuilder)
        return;

    var tour = {},
        api = new sn_tourbuilder.GTPlatformAnalyticsAPI(),
        gtHelper = new GuidedTourDesignerHelper();
        arrayUtil = new ArrayUtil(),
        id = current.sys_id.toString(),
        name = current.name.toString(),
        starting_page = current.context.toString(),
        experience = gtHelper.getExpNameofTour(id);
        roles = current.roles.toString().split(','),
        type = current.type.toString(),
        sys_scope = current.sys_scope.getDisplayValue(),
        sys_package = current.sys_package.getDisplayValue(),
        sn_created = current.sn_created.toString(),
        rolesToCheck = ['admin', 'guided_tour_admin'],
        currentUser = gs.getUser(),
        eventType = '',
        payload_id = '';


    /*
    STRY4611846: GTD Usage Data: New Metrics - Tour Creator and Updater Metadata
    */

    var userRoles = currentUser.getRoles(),
        userhasAdminroles = [];
    rolesToCheck.forEach(function(item) {
        if (userRoles.indexOf(item) !== -1)
            userhasAdminroles.push(item);
    });

    var tourHasAdminRoles = arrayUtil.intersect(['admin', 'guided_tour_admin'], roles);

    if (tourHasAdminRoles.length > 0) {
        api.send({
            tourId: id,
            tourName: name,
            starting_page: starting_page,
            role: tourHasAdminRoles
        }, {
            operationType: current.operation(),
            eventType: 'tour_insert_update_with_admin_roles'
        });
    }

    api.send({
        tourId: id,
        tourName: name,
        starting_page: starting_page,
        role: userhasAdminroles
    }, {
        operationType: current.operation(),
        eventType: 'tour_insert_update'
    });

    api.send({
        tourId: id,
        tourType: type,
        sys_scope: sys_scope,
        sys_package: sys_package
    }, {
        operationType: current.operation(),
        eventType: 'tour_insert_update_1'
    });


    //STRY4701115 - Usage Data: New Metrics - Published and Un-published Tour Metadata

    var status = '',
        currentStatus = current.status.toString(),
        previousStatus = previous.status.toString();
    if (currentStatus === 'published' && previousStatus === 'draft')
        status = [previousStatus, currentStatus].join('_to_');
    else if (currentStatus === 'draft' && previousStatus === 'published')
        status = [previousStatus, currentStatus].join('_to_');

    if (status) {

        api.send({
            tourId: id,
            tourName: name,
            roles: userhasAdminroles,
            experience: experience,
            snCreated: sn_created
        }, {
            operationType: current.operation(),
            eventType: 'tour_status_change_' + status
        });
    }

    /*
    	STRY4701368 - Usage Data: New Metrics - Tour Deactivation and Activation Metadata
    */

    if (current.operation().toString() === 'update' && current.active.toString() !== previous.active.toString()) {
        //Active state is changed
        api = new sn_tourbuilder.GTPlatformAnalyticsAPI();
        //STRY10051612 : LU&A : Reduce custom key metrics to 5
        eventType = 'tour_state_active_';
        payload_id = gs.generateGUID();
        api.send({
            payloadId: payload_id,
            tourId: id,
            tourName: name,
            active: current.active.toString(),
            userId: currentUser.getID(),
        }, {
            operationType: current.operation(),
            eventType: eventType + 'part1'
        });
        api = new sn_tourbuilder.GTPlatformAnalyticsAPI();
        api.send({
            payloadId: payload_id,
            userName: currentUser.getName(),
            roles: userhasAdminroles
        }, {
            operationType: current.operation(),
            eventType: eventType + 'part2'
        });
    }

    //STRY8756115 : LU&A: Include new Skippable/Mandatory field info in tour metadata to Central Collection Server

    if (current.status.toString() === 'published' && current.operation().toString() === 'update' && previous.status.toString() === 'draft') {
        var ga = new GlideAggregate('sys_embedded_tour_step');
        ga.addQuery('guide', id);
        ga.addAggregate('COUNT', 'skippable');
        ga.setGroup(true);
        ga.groupBy('skippable');
        ga.query();
        var totalSteps = skippedSteps = aggrCount = 0;
        while (ga.next()) {
            aggrCount = parseInt(ga.getAggregate('COUNT', 'skippable'));
            if (ga.getDisplayValue('skippable') === 'true')
                skippedSteps = aggrCount;
            totalSteps += aggrCount;
        }
        //STRY10051612 : Reduce custom key metrics to 5
        eventType = 'tour_with_step_details_';
        payload_id = gs.generateGUID();
        api = new sn_tourbuilder.GTPlatformAnalyticsAPI();
        api.send({
            payloadId: payload_id,
            tourId: id,
            tourName: name,
            totalSteps: totalSteps,
            skippedSteps: skippedSteps,
        }, {
            operationType: current.operation(),
            eventType: eventType + 'part1'
        });
        api = new sn_tourbuilder.GTPlatformAnalyticsAPI();
        api.send({
            payloadId: payload_id,
            active: current.active.toString(),
            userId: currentUser.getID(),
            userName: currentUser.getName(),
            roles: current.roles.toString().split(','),
        }, {
            operationType: current.operation(),
            eventType: eventType + 'part2'
        });
        api = new sn_tourbuilder.GTPlatformAnalyticsAPI();
        api.send({
            payloadId: payload_id,
            introModal: current.has_intro.toString(),
            conclModal: current.has_concl.toString()
        }, {
            operationType: current.operation(),
            eventType: eventType + 'part3'
        });
    }

})(current, previous);
