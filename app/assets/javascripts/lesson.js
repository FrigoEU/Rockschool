var Lesson = Backbone.Model.extend({
	defaults: {
		// startTime: (new Date()),
		// duration: standardLessonLength,
		// teacher: 1,
		// student: 1
	},
	//url: "/lessons",
	initialize: function() {
		this.attributes.duration = (this.attributes.endTime.getHours() - this.attributes.startTime.getHours())*60 + (this.attributes.endTime.getMinutes() - this.attributes.startTime.getMinutes());
	},
	parse: function(response){
		var startTime = new Date(response.starttime);
		//startTime.addMinutes(-(startTime.getTimezoneOffset()));
		var endTime = new Date(response.endtime);
		//endTime.addMinutes(-(endTime.getTimezoneOffset()))
		var students = _.map(response.students, function(obj){
			if (obj === undefined) {return undefined;}
			else {return allStudents.get(obj.id);}
		});
		return {startTime: startTime,
				endTime: endTime,
				teacher: response.teacher_id,
				students: students,
				status: response.status,
				lessongroup_id: response.lessongroup_id,
				id: parseInt(response.id,10),
				paid: response.paid,
				maximumNumberOfStudents: parseInt(response.maximum_number_of_students, 10),
				approved: response.approved
		};
	},
	statusToDutch: function() {
		var status= this.get("status");
		return LessonStatusses[status].name;
	},
	getStudentName: function() {
		if (this.isGroupLesson()) {return "Groepsles";}
		else {
			if (this.get("students")[0] !== undefined) {return this.get("students")[0].getName();}
			else {return ''}
		}
	},
	isGroupLesson: function() {
		return (this.get("maximumNumberOfStudents") > 1);
	}
});

var Lessons = Backbone.Collection.extend({
	initialize: function() {
	},
	model: Lesson,
	url:"/lessons"
});
var LessonActions = {
	open: {action: 'open', label: 'Les open'},
	absentreq: {action: 'absentreq', label: 'Vraag afwezigheid aan'},
	absentok: {action: 'absentok', label: 'Wettelijk afwezig'},
	absentnok: {action: 'absentnok', label: 'Afwezig'},
	done: {action: 'done', label: 'Les OK'}
};
LessonActions = _.extend(LessonActions, EnrollmentActions);
var LessonStatusses = {
	open: {key:"open", name: "Open", possibleActions: [LessonActions.absentreq, LessonActions.absentok, LessonActions.absentnok, LessonActions.done, LessonActions.removeenrollment]},
	done: {key: "done", name: "Les OK", possibleActions: [LessonActions.open]},
	absentreq: {key: "absentreq", name: "Afwezigheid aangevraagd", possibleActions: [LessonActions.absentok, LessonActions.absentnok]},
	absentok: {key: "absentok", name: "Wettelijk afwezig", possibleActions: [LessonActions.open, LessonActions.done]},
	absentnok: {key: "absentnok", name: "Afwezig", possibleActions: [LessonActions.open, LessonActions.done]}
};
//Kan dit niet beter?
var LessonStatussesArray = [LessonStatusses.done, LessonStatusses.absentreq, LessonStatusses.absentok, LessonStatusses.absentnok];

var LessonDropDownView = DropDownView.extend({
	initialize: function () {

	},
	events: {
		"click .status": "changeStatus",
		"click .enroll": "enrollment",
		"click .grouplessonDetails": "grouplessonDetails"
	},
	render: function() {
		this.constructor.__super__.render.apply(this);
	},
	renderInnerHTML: function(){
		if (!this.options.lesson.isGroupLesson()) {
			this.template = $("#lessonDropDownTemplate");
			var choicesArray =[];
			// Haal keuzes op die horen bij status van les
			choicesArray = _.clone(LessonStatusses[this.options.lesson.get('status')].possibleActions);

			//Voeg keuzes bij die horen bij status van enrollment
			if (this.options.lesson.get('approved') === false){
				choicesArray.push(LessonActions.accept);
				choicesArray.push(LessonActions.reject);
				_.each(choicesArray, function(value, key, list){
					if (list[key] == LessonActions.removeenrollment){
						list.splice(key, 1);
					}
				})
			}
			else if (this.options.lesson.get('paid') === false) {
				choicesArray.push(LessonActions.pay);
			}

			var argumentHash = {
				studentName: this.options.lesson.get("students")[0].getName(),
				teacher: allTeachers.get(this.options.lesson.get("teacher")).toJSON(),
				datetime: this.options.lesson.get('startTime').toString("ddd dd MMM yyyy, HH:mm"),
				status: this.options.lesson.statusToDutch(),
				choices: choicesArray
			};
			return Mustache.render(this.template.html(),argumentHash);
		}
		else {
			//Groepsles
			this.template = $('#grouplessonDropDownTemplate');
			return Mustache.render(this.template.html(), {});
		}
	},
	changeStatus: function(e){
		this.options.lesson.save({
				data: {action: $(e.target).data("action")}},{
				success: function(){
					moderator.reloadMainscreen();
				},
				error: function(model, response, options) {
					standardHTTPErrorHandling(model, response, options);
				}
		});
	},
	enrollment: function(e){
		moderator.showDialog('enrollmentDialog', {
			lessongroup_id: this.options.lesson.get('lessongroup_id'),
			teacher: allTeachers.get(this.options.lesson.get('teacher')),
			startTime: this.options.lesson.get('startTime'),
			duration: this.options.lesson.get('duration')
		});
	},
	grouplessonDetails: function(e){
		var enrollments = new Enrollments();
		var clickedLesson = this.options.lesson;
		enrollments.fetch({
			data: {'lessongroup_id': clickedLesson.get('lessongroup_id')},
			success: function(model, response, options){
				moderator.showDialog('grouplessonDetailsDialog', {
					collection: model,
					teacher: allTeachers.get(clickedLesson.get('teacher')),
					startTime: clickedLesson.get('startTime'),
					duration: clickedLesson.get('duration'),
					maximumNumberOfStudents: clickedLesson.get('maximumNumberOfStudents')
				});
			}
		});
	}
});
var LessonsSearchView = Backbone.View.extend({
	initialize: function () {

	},
	events: {
		"click .searchButton": "searchLessons",
		"click .lessonbox": "showDropdown"
	},
	render: function(){
		//To Do: map lessons naar array van hashes met oa. student name in!!
		$(this.el).html(Mustache.to_html(this.options.template.html(),{statusses: LessonStatussesArray, lessons: this.collection.models}));
		$(this.el).find("button.searchButton").button();
		return this;
	},
	searchLessons: function(event){
		var status = this.$el.find("select").val();
		console.log("status = ", status);
		var self = this;
		this.collection.fetch({
			data: {'inquirystatus': status},
			success: function(model, response, options){
				//this.collection.parse(response);
				self.render();
			}
		});
	},
	showDropdown: function(event){
		var lesson = this.collection.get($(event.target).data('id'));

		moderator.showLessonDropDown(event.pageX, event.pageY, lesson);
	}
});
