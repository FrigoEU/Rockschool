var Lesson = Backbone.Model.extend({
	defaults: {
	},
	urlRoot: "/lessons",
	initialize: function() {
		this.attributes.duration = (this.attributes.endTime.getHours() - this.attributes.startTime.getHours())*60 + (this.attributes.endTime.getMinutes() - this.attributes.startTime.getMinutes());
	},
	parse: function(response){
		var startTime = new Date(response.starttime);
		if (!startTime.dst()){
			startTime.addMinutes(-(startTime.getTimezoneOffset()));	
		}
		var endTime = new Date(response.endtime);
		if (!endTime.dst()){
			endTime.addMinutes(-(endTime.getTimezoneOffset()))
		}
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
		if (this.isGroupLesson() && this.userIsAuthorized()) {return "Groepsles";}
		else {
			if (this.get("students")[0] !== undefined) {return this.get("students")[0].getName();}
			else {return ''}
		}
	},
	isGroupLesson: function() {
		return (this.get("maximumNumberOfStudents") > 1);
	},
	userIsAuthorized: function(){
		//Status wordt als nil meegegeven vanuit server als de user niet geauthoriseerd was!
		return !(this.status == null || this.status == undefined)
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
	open: {key:"open", name: "Open", studentPossibleActions:[LessonActions.absentreq], adminPossibleActions: [LessonActions.absentreq, LessonActions.absentok, LessonActions.absentnok, LessonActions.done, LessonActions.removeenrollment]},
	done: {key: "done", name: "Les OK", studentPossibleActions:[], adminPossibleActions: [LessonActions.open]},
	absentreq: {key: "absentreq", name: "Afwezigheid aangevraagd", studentPossibleActions:[], adminPossibleActions: [LessonActions.absentok, LessonActions.absentnok]},
	absentok: {key: "absentok", name: "Wettelijk afwezig", studentPossibleActions:[], adminPossibleActions: [LessonActions.open, LessonActions.done]},
	absentnok: {key: "absentnok", name: "Afwezig", studentPossibleActions:[], adminPossibleActions: [LessonActions.open, LessonActions.done]}
};
//Kan dit niet beter?
var LessonsSearchStatussesArray = [LessonStatusses.done, LessonStatusses.absentreq, LessonStatusses.absentok, LessonStatusses.absentnok];

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
			choicesArray = _.clone(LessonStatusses[this.options.lesson.get('status')][current_user_role + 'PossibleActions']);

			//Voeg keuzes bij die horen bij status van enrollment
			if (current_user_role == "admin"){
				if (this.options.lesson.get('approved') === false){
					choicesArray.push(LessonActions.accept);
					choicesArray.push(LessonActions.reject);
					_.each(choicesArray, function(value, key, list){
						if (list[key] == LessonActions.removeenrollment){
							list.splice(key, 1);
						}
					});
				}
				else if (this.options.lesson.get('paid') === false) {
					choicesArray.push(LessonActions.pay);
				}
			}

			var argumentHash = {
				studentName: this.options.lesson.get("students")[0].getName(),
				teacherName: allTeachers.get(this.options.lesson.get("teacher")).getName(),
				datetime: this.options.lesson.get('startTime').toString("ddd dd MMM yyyy, HH:mm"),
				status: this.options.lesson.statusToDutch(),
				choicesmenu: (choicesArray.length > 0),
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
		var action =  $(e.target).data("action");
		this.options.lesson.save({
				data: {action: action}},{
				success: function(model, response, options){
					moderator.reloadMainscreen();
					if (action == "absentok"){
						moderator.showDialog('newLessonDialog',{
							oldLesson: model
						})
					}
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
		"click input[type=radio]": "searchLessons",
		"click .lessonbox": "showDropdown"
	},
	render: function(){
		//To Do: map lessons naar array van hashes met oa. student name in!!
		$(this.el).html(Mustache.to_html(this.options.template.html(),{statusses: LessonsSearchStatussesArray, lessons: this.collection.models}));
		$(this.el).find("#statusses").buttonset();
		return this;
	},
	searchLessons: function(event){
		var status = event.currentTarget.value;
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
var NewLessonDialog = Backbone.View.extend({
	initialize: function (){
	},
	id: 'newLessonDialog',
	render: function (){
		$("body").append(Mustache.render(this.options.template.html(),{}));
		var newLessonDialog = $('#'+this.id);
		var self = this;

		newLessonDialog.dialog({
			autoOpen: true,
			height: 250,
			width: 450,
			modal: true,
			buttons:{
				Ja: function() {
					$( this ).dialog( "close" );
					var lesson = new Lesson({
						startTime: self.oldLesson.get('startTime'),
						endTime: self.oldLesson.get('endTime'),
						teacher: self.oldLesson.get('teacher'),
						students: self.oldLesson.get('students'),
						lessongroup_id: self.oldLesson.get('lessongroup_id')
					});
					lesson.save(null,{
						success:function(model, response, options){
							moderator.showDialog('generalDialog', {
								title: "Nieuwe les gemaakt",
								text:"Er is een nieuwe les aangemaakt, op " + model.get('startTime').toString('dd/MM/yyyy') + ' !'
							})
						},
						error: function(model, response, options) {
							standardHTTPErrorHandling(model, response, options);
						}
					});
				},
				Nee: function() {
					$( this ).dialog( "close" );
				}
			}
		});
	}
});