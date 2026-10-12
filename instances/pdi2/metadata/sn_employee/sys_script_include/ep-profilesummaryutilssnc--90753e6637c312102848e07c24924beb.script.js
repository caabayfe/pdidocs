var ep_ProfileSummaryUtilsSNC = Class.create();
ep_ProfileSummaryUtilsSNC.prototype = {
    initialize: function() {
        this.epUtils = new sn_employee.ep_Utils();
        this.isSkillsInstalled = GlidePluginManager.isActive("com.sn_skills_int");
        this.ALLOWED_PERSONAS_FOR_SKILLS = ["manager", "leader"];
        this.SOURCE_INDIRECT_MANAGER = "indirect_manager";
    },

    /**
     * Get the profile summary of the employee
     * @param {String} userId - User sys_id
     * @param {String} startDate - Start date
     * @param {String} endDate - End date
     * @returns {Object} - Profile summary of the employee
        {
			"employeeDetails": {
				"name": "Emily Scollan",
				"employmentStartDate": "2018-03-28",
				"positionType": "",
				"department": "Customer Success",
				"location": "New York",
                		"locationType": "Office",
                		"preferredPronoun": "She/Her",
				"currentRole": {
				"title": "Customer Support Specialist",
				"roleLevel": "Customer Support Specialist",
				"jobFamily": "Customer Success Management",
				"jobProfile": {
					"JobProfileName": "Customer Success Manager",
					"startDate": "2023-01-09",
					"endDate": ""
				}
				},
				"jobProfileHistory": [
				{
					"JobProfile": "Customer Success Associate",
					"startDate": "2019-08-05",
					"endDate": "2023-01-06"
				}
				],
				"skills": {
				"validatedSkills": [
					{
					"name": "Time Management",
					"proficiency": "Intermediate"
					}
				],
				"unvalidatedSkills": [
					{
					"name": "Communication",
					"proficiency": "Intermediate"
					}
				]
				},
				"skillStrengths": [
				"Communication"
				],
				"skillsToDevelopForCurrentRole": {
				"skillGaps": [],
				"proficiencyGaps": [
					{
					"name": "Troubleshooting",
					"requiredProficiency": "Intermediate"
					},
					{
					"name": "Product Support",
					"requiredProficiency": "Intermediate"
					}
				]
				},
				"nextPotentialRoleVertical": {
				"roleLevel": "Senior Customer Support Specialist",
				"roleGroup": "Customer Support",
				"jobLevel": "IC2",
				"match": "0.368",
				"skillGapForNextRole": [],
				"proficiencyGapForNextRole": [
					{
					"skillName": "Troubleshooting",
					"currentProficiency": "Novice",
					"proficiencyRequired": "Intermediate"
					}
				]
				},
				"nextPotentialRolesLateral": []
			}
		}
     */
    getProfileSummary: function(userId, filters) {
        if (!userId)
            throw new Error("[ep_ProfileSummaryUtilsSNC.getProfileSummary]: required input parameter userId is empty.");

        let {
            startDate,
            endDate,
            persona
        } = filters;
        let epGr = this.epUtils.getEmployeeProfileRecord(userId);

        if (!epGr || epGr == null)
            return {};

        let profileSummary = {
            "employeeDetails": {
                "name": epGr.user.name.getDisplayValue(),
                "employmentStartDate": epGr.getDisplayValue("employment_start_date"),
                "department": epGr.user.department.getDisplayValue()
            }
        };
        epGr.position_type.getDisplayValue() && (profileSummary.employeeDetails['positionType'] = epGr.position_type.getDisplayValue());
        epGr.user.location.getDisplayValue() && (profileSummary.employeeDetails['location'] = epGr.user.location.getDisplayValue());
        epGr.location_type.getDisplayValue() && (profileSummary.employeeDetails['locationType'] = epGr.location_type.getDisplayValue());
        profileSummary.employeeDetails['preferredPronoun'] = epGr.preferred_pronoun.getDisplayValue() || "Not Available";

        if (!profileSummary.employeeDetails['positionType'] && epGr.hr_profile.employment_type.getDisplayValue()) {
            profileSummary.employeeDetails['positionType'] = epGr.hr_profile.employment_type.getDisplayValue();
        }

        if (this.isSkillsInstalled) {
            let jobProfilesHistory = this._getJobProfilesHistory(epGr.getUniqueValue(), startDate, endDate);
            jobProfilesHistory.length > 0 && (profileSummary.employeeDetails['jobProfilesHistory'] = jobProfilesHistory);

            if (this.ALLOWED_PERSONAS_FOR_SKILLS.includes(persona)) {
                try {
                    let employeeSkillSummary = new sn_skills_int.EmployeeSkillSummaryAPI().getEmpSkillSummaryForPersonaAssistant(userId);
                    let {
                        userName,
                        ...skillsData
                    } = employeeSkillSummary;

                    profileSummary.employeeDetails = {
                        ...profileSummary.employeeDetails,
                        ...skillsData
                    };
                } catch (e) {
                    gs.error("getEmpSkillSummaryForPersonaAssistant method not available in sn_skills_int.EmployeeSkillSummaryAPI. Update Skills Intelligence plugin. " + e.message);
                }
            } else {
                var currentRoleInformation = this._getCurrentRoleInformation(userId);
                profileSummary.employeeDetails = {
                    ...profileSummary.employeeDetails,
                    ...currentRoleInformation
                };
            }
        }
        return profileSummary;
    },

    /**
     * Get the profile summaries of multiple employees
     * @param {Array} userIds - Array of User sys_ids
     * @param {Object} filters - Filters object containing startDate, endDate, persona
     * @returns {Object} - Object containing employees array with profile summary objects
    {
        "employees": [
            {
                "employeeId": "sys_id",
                "employeeName": "First Last",
                "department": "<department>",
                "jobTitle": "<title>",
                "employmentStartDate": "2018-03-28",
                "skills": {
                    "gaps": ["skill1", "skill2"],
                    "strengths": ["skill1", "skill2", "skill3"]
                }
            },
            {
                "employeeId": "sys_id",
                "employeeName": "First Last",
                "department": "<department>",
                "jobTitle": "<title>",
                "employmentStartDate": "2018-03-28",
                "skills": {
                    "gaps": ["skill1", "skill2"],
                    "strengths": ["skill1", "skill2", "skill3"]
                }
            }
        ]
    }
    
     */
    getProfileSummaries: function(userIds, filters) {
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0)
            throw new Error("[ep_ProfileSummaryUtilsSNC.getProfileSummaries]: required input parameter userIds must be a non-empty array.");


        // Get all user titles in a single query
        let userGr = new GlideRecordSecure('sys_user');
        userGr.addQuery('sys_id', 'IN', userIds.join(','));
        userGr.query();
        
        let userTitleMap = {};
        while (userGr.next()) {
            let userId = userGr.getUniqueValue();
            userTitleMap[userId] = userGr.getValue('title') || '';
        }
        let employeesSkillSummary = {};
        if (this.isSkillsInstalled) {
            try {
                employeesSkillSummary = new sn_skills_int.EmployeeSkillSummaryAPI().getEmpsSkillSummaryForMultipleUsers(userIds);
            } catch (e) {
                gs.error("getEmpsSkillSummaryForMultipleUsers method not available in sn_skills_int.EmployeeSkillSummaryAPI. Update Skills Intelligence plugin. ");
            }
        }
        var profileGr = new GlideRecordSecure('sn_employee_profile');
        profileGr.addQuery('user', 'IN', userIds.join(','));
        profileGr.query();

        let profileSummariesArray = [];

        while (profileGr.next()) {
            let userId = profileGr.getValue('user');
            
            let profileData = {
                "employeeId" : userId,
                "employeeName": profileGr.user.name.getDisplayValue(),
                "jobTitle": userTitleMap[userId] || '',
                "employmentStartDate": profileGr.getDisplayValue("employment_start_date"),
                "department": profileGr.user.department.getDisplayValue()
            };
            
            // Add skills data only if Skills Intelligence plugin is installed
            if (this.isSkillsInstalled && employeesSkillSummary[userId]) {
                profileData.skills = {
                    "gaps": employeesSkillSummary[userId].gapSummary || [],
                    "strengths": employeesSkillSummary[userId].strengthSummary || []
                };
            }
            
            profileSummariesArray.push(profileData);
        }
        
        return {
            "employees": profileSummariesArray
        };
    },

    /**
     * Get the job profiles of the employee
     * @param {String} empProfileId - Employee profile sys_id
     * @param {String} startDate - Start date
     * @returns {Array} - Job profiles of the employee
     */
    _getJobProfilesHistory: function(empProfileId, startDate, endDate) {
        let jobProfileGr = new GlideRecordSecure("sn_employee_position");
        if (!gs.nil(startDate) && !gs.nil(endDate))
            jobProfileGr.addEncodedQuery(`end_date>=${startDate}^end_date<=${endDate}^NQstart_date>=${startDate}^start_date<=${endDate}^NQstart_date<=${startDate}^end_date>=${endDate}`);
        else if (!gs.nil(startDate))
            jobProfileGr.addEncodedQuery(`end_date>=${startDate}`);
        else if (!gs.nil(endDate))
            jobProfileGr.addEncodedQuery(`start_date<=${endDate}^end_dateISNOTEMPTY`);
        else
            jobProfileGr.addEncodedQuery(`end_dateISNOTEMPTY`);

        jobProfileGr.addQuery("employee_profile", empProfileId);
        jobProfileGr.orderByDesc('start_date');
        jobProfileGr.query();
        let jobProfiles = [];
        while (jobProfileGr.next()) {
            var jobData = {
                "jobProfile": jobProfileGr.job_profile.getDisplayValue(),
                "startDate": jobProfileGr.start_date.getDisplayValue(),
                "endDate": jobProfileGr.end_date.getDisplayValue()
            };
            jobProfiles.push(jobData);
        }
        return jobProfiles;
    },

    /**
     * Get current role information of the employee
     * @param {String} userId - user sys_id
     * @returns {Object} - Current role information of the employee
     */
    _getCurrentRoleInformation: function(userId) {
        let userGr = new GlideRecord('sys_user');
        if (userGr.get(userId) && userGr.canRead())
            var title = userGr.getValue('title');

        try {
            var primaryRoleDetails = new sn_skills_int.EmployeeUtils().getPrimaryEmployeeRoleDetails(userId);
        } catch (error) {
            gs.error('Exception occurred in sn_skills_int.EmployeeSkillProfileUtilSNC.getUserSkills ' + error);
        }

        try {
            var latestJobProfileGr = new sn_skills_int.EmployeeUtils().getLatestEmployeePosition(userId);
        } catch (error) {
            gs.error('Exception occurred in sn_skills_int.EmployeeUtils.getLatestEmployeePosition ' + error);
        }

        if (primaryRoleDetails && primaryRoleDetails.roleLevel) {
            var roleLevel = primaryRoleDetails.roleLevel;
            var jobFamily = primaryRoleDetails.jobFamily;
        }

        const currentRole = {};

        !gs.nil(title) && (currentRole['title'] = title);
        !gs.nil(roleLevel) && (currentRole['roleLevel'] = roleLevel.name);
        !gs.nil(jobFamily) && (currentRole['jobFamily'] = jobFamily.name);
        !gs.nil(latestJobProfileGr) && (currentRole['jobProfile'] = {
            "JobProfileName": latestJobProfileGr.job_profile.getDisplayValue(),
            "startDate": latestJobProfileGr.start_date.getDisplayValue()
        });

        return {
            currentRole
        };
    },

    /**
    * Get the secondary/indirect manager for a given user.
    * @param {String} userId - The sys_id of the employee.
    * @return {Object} - An object containing the secondary manager's details, or an empty object if not found.
    */
    getIndirectManagers: function(userId) {
        var indirectManagers = [];
        if (gs.nil(userId))
            return indirectManagers;

        var indirectManagerRelGr = new GlideRecordSecure("sn_employee_secondary_manager_relationship");
        indirectManagerRelGr.addQuery("employee.user", userId);
        indirectManagerRelGr.query();

        while (indirectManagerRelGr.next()) {
            var indirectManagerId = indirectManagerRelGr.secondary_manager.user;
            if (indirectManagerId) {
                var userGr = new GlideRecordSecure('sys_user');
                if (userGr.get(indirectManagerId)) {
                    indirectManagers.push({
                        sys_id: userGr.getUniqueValue(),
                        name: userGr.getValue('name'),
                        email: userGr.getValue('email'),
                        source: this.SOURCE_INDIRECT_MANAGER,
                        title: userGr.getValue('title')
                    });
                }
            }
        }
        return indirectManagers;
    },

    type: 'ep_ProfileSummaryUtilsSNC'
};
