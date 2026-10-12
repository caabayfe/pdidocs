var CloudRunnerAPI = Class.create();

var TestGenerationAPI = {
	startJob: function (props) {
		return sn_atf_tg.DW.TestGenerationApiLibrary.TestGenerationApi.startJob({
			tableEncodedQuery: props.hasOwnProperty('tableEncodedQuery') ? props.tableEncodedQuery: "", 
			userEncodedQuery: props.hasOwnProperty('userEncodedQuery') ? props.userEncodedQuery: "",
			catalogEncodedQuery: props.hasOwnProperty('catalogEncodedQuery') ? props.catalogEncodedQuery : "",
			maxTestCount: props.hasOwnProperty('maxTestCount') ? props.maxTestCount : 2000,
			maxTestCountPerItem: props.hasOwnProperty('maxTestCountPerItem') ? props.maxTestCountPerItem : 2,
			maxTestCountPerTable: props.hasOwnProperty('maxTestCountPerTable') ? props.maxTestCountPerTable : 5,
			email: props.hasOwnProperty('email') ? props.email : "",
			separateUpdateSetPerScope: props.hasOwnProperty('separateUpdateSetPerScope') ? props.separateUpdateSetPerScope : false,
			scopeForGeneratingTests: props.hasOwnProperty('scopeForGeneratingTests') ? props.scopeForGeneratingTests : 'global',
			suiteName: props.hasOwnProperty('suiteName') ? props.suiteName : '',
			});
	},

	cancelJob: function (props) {
		return sn_atf_tg.DW.TestGenerationApiLibrary.TestGenerationApi.cancelJob({
			snboqId: props.hasOwnProperty('snboqId') ? props.snboqId: ""
		});
	},

	progress: function (props) {
		return sn_atf_tg.DW.TestGenerationApiLibrary.TestGenerationApi.progress({
			snboqId: props.hasOwnProperty('snboqId') ? props.snboqId: ""
		});
	},

	type: 'TestGenerationAPI'
};

var TestRunnerAPI = {
	startJob: function (props) {
		return sn_atf_tg.DW.TestRunnerApiLibrary.TestRunnerApi.startJob({
			testId: props.hasOwnProperty('testId') ? props.testId: ""
			});
	},

	cancelJob: function (props) {
		return sn_atf_tg.DW.TestRunnerApiLibrary.TestRunnerApi.cancelJob({
			snboqId: props.hasOwnProperty('snboqId') ? props.snboqId: ""
		});
	},

	progress: function (props) {
		return sn_atf_tg.DW.TestRunnerApiLibrary.TestRunnerApi.progress({
			snboqId: props.hasOwnProperty('snboqId') ? props.snboqId: ""
		});
	},

	type: 'TestGenerationAPI'
};

var TestUserAPI = {
	startJob: function (props) {
		return sn_atf_tg.DW.TestUserApiLibrary.TestUserApi.startJob({
			username: props.hasOwnProperty('username') ? props.username: ""
			});
	},

	cancelJob: function (props) {
		return sn_atf_tg.DW.TestUserApiLibrary.TestUserApi.cancelJob({
			snboqId: props.hasOwnProperty('snboqId') ? props.snboqId: ""
		});
	},

	selectCloudUser: function (props) {
		return sn_atf_tg.DW.TestUserApiLibrary.TestUserApi.selectCloudUser({
			username: props.hasOwnProperty('username') ? props.username: ""
		});
	},

	isValidCloudUser: function (props) {
		return sn_atf_tg.DW.TestUserApiLibrary.TestUserApi.isValidCloudUser({
			username: props.hasOwnProperty('username') ? props.username: ""
		});
	},

	progress: function (props) {
		return sn_atf_tg.DW.TestUserApiLibrary.TestUserApi.progress({
			snboqId: props.hasOwnProperty('snboqId') ? props.snboqId: ""
		});
	},

	type: 'TestUserAPI'
};

CloudRunnerAPI = {
	TestGenerationAPI: TestGenerationAPI,
	TestRunnerAPI: TestRunnerAPI,
	TestUserAPI: TestUserAPI,
    type: 'CloudRunnerAPI'
};
