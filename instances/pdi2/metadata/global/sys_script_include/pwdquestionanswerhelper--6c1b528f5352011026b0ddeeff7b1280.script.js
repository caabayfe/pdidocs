var PwdQuestionAnswerHelper = Class.create();
PwdQuestionAnswerHelper.prototype = {
    initialize: function() {},

    getQuestionsList: function(requestId, userId, verificationId, num_reset, num_enroll) {
        userId = userId.trim().toLowerCase();
        var lengthOfSHA_256 = 76;
        var isRequestInvalid = new SNC.PwdTrackingManager().isRequestInvalid(requestId);
        var enrolledQuestions = {
            "q_id": [],
            "q": [],
            "answerId": [],
            "answerHashType": []
        };

        var isUserEnrolled = new SNC.PwdEnrollmentManager().isUserEnrolledByVerificationId(userId, verificationId);
        if (isRequestInvalid && !isUserEnrolled) {
            var gr = new GlideAggregate('pwd_question');
            gr.addAggregate('COUNT');
            gr.query();
            if (gr.next()) {
                var questionsCount = parseInt(gr.getAggregate('COUNT'));
            }
            num_enroll = parseInt(num_enroll);
            num_enroll = num_enroll > questionsCount ? questionsCount : num_enroll;
            var questions = [];
            var hash = 1;
            var j = 0;
            for (var i = 0; i < userId.length; i++)
                hash = hash + userId.charCodeAt(i);
            while (hash.toString().length < num_enroll) {
                hash = hash * hash;
            }
            var count = Math.pow(10, questionsCount.toString().length);
            while (j < num_enroll) {
                var num = (hash % count) % questionsCount;
                if (questions.indexOf(num) == -1) {
                    questions.push(num);
                    j++;
                }
                count = count + 1;
            }
            var gr_questions = new GlideRecord("pwd_question");
            gr_questions.orderByDesc('sys_name');
            gr_questions.query();
            count = 0;
            while (gr_questions.next()) {
                if (questions.indexOf(count) != -1) {
                    enrolledQuestions.q_id.push(gr_questions.getValue("sys_id"));
                    enrolledQuestions.q.push(gr_questions.getDisplayValue("question_translated"));
                    enrolledQuestions.answerHashType.push("SHA-256");
                }
                count++;
            }
        } else {
            var gr_answers = new GlideRecord('pwd_active_answer');
            gr_answers.addJoinQuery('pwd_enrollment', 'enrollment', 'sys_id');
            gr_answers.addQuery('enrollment.verification', verificationId);
            gr_answers.addQuery('enrollment.user', userId);
            gr_answers.query();
            while (gr_answers.next()) {
                enrolledQuestions.q_id.push(gr_answers.active_question.sys_id.toString());
				enrolledQuestions.q.push(this._getEnrolledQuestion(gr_answers.active_question.question.toString()));
                enrolledQuestions.answerId.push(gr_answers.sys_id.toString());
                enrolledQuestions.answerHashType.push(gr_answers.normalized_answer.toString().length < lengthOfSHA_256 ? "SHA-1" : "SHA-256");
            }
        }
        return enrolledQuestions;
    },

	_getEnrolledQuestion: function(enrolledQuestion) {
		var question = this._getQuestion(enrolledQuestion);
		if(question !== "") {
			return question;
		}
		// Enrolled question is in localised language. Fetch the equivalent english question for enrolled question
		var enrolledQuestionInEnglish = this._getQuestionInEnglish(enrolledQuestion);

		if(enrolledQuestionInEnglish !== "") {
			enrolledQuestion = this._getQuestion(enrolledQuestionInEnglish);
		}
		return enrolledQuestion;
	},

	// Get the question in current localised language
	_getQuestion: function(question) {
		var grQuestion = new GlideRecord("pwd_question");
		grQuestion.addActiveQuery();
		grQuestion.addQuery("question_translated", question);
		grQuestion.query();
		if(grQuestion.next()) {
			return grQuestion.getDisplayValue("question_translated");
		}
		return "";
	},

	// Get english equivalent question
	_getQuestionInEnglish: function(question) {
		var grSysTranslated = new GlideRecord("sys_translated");
		grSysTranslated.addQuery("label", question);
		grSysTranslated.addQuery("name", "pwd_question");
		grSysTranslated.addActiveQuery();
		grSysTranslated.query();
		if(grSysTranslated.next()) {
			return grSysTranslated.getValue("value");
		}
		return "";
	},

    type: 'PwdQuestionAnswerHelper'
};
