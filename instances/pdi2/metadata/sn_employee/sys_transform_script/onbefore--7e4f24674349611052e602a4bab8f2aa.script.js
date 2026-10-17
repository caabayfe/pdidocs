(function runTransformScript(source, map, log, target /*undefined onStart*/ ) {

    var SOURCE_TYPE = "HCM_FILE_UPLOAD";
    if (source.u_user_id.nil() && source.u_business_title.nil() && source.u_location.nil() &&
        source.u_job_family.nil() && source.u_job_title.nil() && source.u_job_code.nil() &&
        source.u_job_level.nil() && source.u_employment_type.nil() &&
        source.u_location_type.nil() && source.u_start_date.nil() &&
        source.u_end_date.nil() &&
        source.u_work_description.nil()) {
        ignore = true;
        return 0;
    }

    if (source.u_user_id.nil()) {
        log.warn('User id cannot be empty');
        ignore = true;
        return 0;
    }
    
    if (source.u_start_date.nil()) {
        log.warn('Start date cannot be empty');
        ignore = true;
        return 0;
    }

    //Date validation
    if (source.u_start_date.nil() && source.u_end_date != "") {
        log.warn('Start date must be provided');
        ignore = true;
        return 0;
    }

    if (source.u_start_date != "" && source.u_end_date != "") {
        var startDateMs = new GlideDateTime(source.u_start_date).getNumericValue();
        var endDateMs = new GlideDateTime(source.u_end_date).getNumericValue();
		
        // 0 from "getDateFormat" means an invalid date string was passed to it
        if (startDateMs === 0 || endDateMs === 0) {
            if (startDate === 0)
                log.warn("Start is invalid");
            if (endDate === 0)
                log.warn("End date is invalid ");
            ignore = true;
            return 0;
        }
        if (startDateMs >= endDateMs) {
            log.warn("Start date must be after end date");
            ignore = true;
            return 0;
        }

    }
    var presentDate = new GlideDateTime();

    if(presentDate < new GlideDateTime(source.u_start_date)) {
        log.warn("Start date is in future.");
        ignore = true;
        return 0;
    }

    //Check sys_user is exists or not, if not ignore inserting
    var grSysUser = new GlideRecord('sys_user');
    grSysUser.addQuery("user_name", source.u_user_id);
    grSysUser.query();
    if (grSysUser.next()) {
        //Check sn_employee_profile is exists or not, if not ignore inserting
        var grEmployeeProfile = new GlideRecord('sn_employee_profile');
        grEmployeeProfile.addQuery("user", grSysUser.sys_id.toString());
        grEmployeeProfile.query();
        if (grEmployeeProfile.next()) {
            //Check job profile(s) is exists or not, if not ignore inserting
            var grJobProfile = new GlideRecord('sn_skills_int_job_family_m2m_job_profile');
            grJobProfile.addQuery("job_family.name", source.u_job_family);
            grJobProfile.addQuery("job_profile.job_code", source.u_job_code);
            grJobProfile.addQuery("job_profile.job_level.name", source.u_job_level);
            grJobProfile.query();
            if (grJobProfile.next()) {
                //Check employee position is exists or not, if not insert/update
                var grEmployeePosition = new GlideRecord('sn_employee_position');
                grEmployeePosition.addQuery("job_profile", grJobProfile.job_profile.sys_id.toString());
                grEmployeePosition.addQuery("employee_profile", grEmployeeProfile.sys_id.toString());
                grEmployeePosition.addActiveQuery();
                grEmployeePosition.query();
                //Get location refferance
                var grLocation = new GlideRecord('cmn_location');
                grLocation.addQuery('name', source.u_location).addOrCondition('city', source.u_location);
                grLocation.orderByDesc('name');
                grLocation.query();
                var locationId = null;
                if (grLocation.next()) {
                    locationId = grLocation.sys_id.toString();
                }

                if (grEmployeePosition.next()) {
                    //Update sn_employee_posstion other details
                    grEmployeePosition.location = locationId;
                    grEmployeePosition.primary = source.u_primary;
                    grEmployeePosition.business_title = source.u_business_title;
                    grEmployeePosition.employment_type = source.employment_type;
                    grEmployeePosition.location_type = source.u_location_type;
                    grEmployeePosition.start_date = source.u_start_date;
                    grEmployeePosition.end_date = source.u_end_date;
                    grEmployeePosition.work_description = source.u_work_description;
                    grEmployeePosition.source = SOURCE_TYPE;
                    grEmployeePosition.update();
                    ignore = true;
                } else {
                    //Insert job position
                    target.job_profile = grJobProfile.job_profile.toString();
                    target.employee_profile = grEmployeeProfile.sys_id.toString();
                    target.location = locationId;
                    target.source = SOURCE_TYPE;
                    //Read 
                    var grJobFamily = new GlideRecord('sn_skills_int_job_family');
                    grJobFamily.addQuery("name", source.u_job_family);
                    grJobFamily.query();
                    if (grJobFamily.next()) {
                        target.job_family = grJobFamily.sys_id.toString();
                    }
                }
            } else {
                log.warn('Job profile does not exist for ' + source.u_user_id);
                ignore = true;
            }
        } else {
            log.warn('Employee profile does not exist for  ' + source.u_user_id);
            ignore = true;
        }

    } else {
        log.warn('User does not exist ' + source.u_user_id);
        ignore = true;
    }
})(source, map, log, target);
