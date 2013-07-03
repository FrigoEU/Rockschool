var Lesson = Backbone.Model.extend({
	defaults: {
		startTime: (new Date()),
		duration: standardLessonLength,
		teacher: 1,
		student: 1
	},
	//url: "/lessons",
	initialize: function() {
		this.attributes.duration = (this.attributes.endTime.getHours() - this.attributes.startTime.getHours())*60 + (this.attributes.endTime.getMinutes() - this.attributes.startTime.getMinutes());
	},
	parse: function(response){
		var startTime = new Date(response.starttime);
		//startTime.addMinutes(-(startTime.getTimezoneOffset()));
		var endTime = new Date(response.endtime);
		//endTime.addMinutes(-(endTime.getTimezoneOffset()));
		return {startTime: startTime,
				endTime: endTime,
				teacher: response.teacher_id,
				student: 1, //bug!
				status: response.status,
				lessongroup_id: response.lessongroup_id,
				id: response.id,
				paid: response.paid
		};
	},
	statusToDutch: function() {
		var status= this.get("status");
		return LessonStatusses[status].name;
	}
});
var Lessons = Backbone.Collection.extend({
	initialize: function() {
	},
	model: Lesson,
	url:"/lessons"
});
var LessonActions = {
	accept: {action: 'acceptenrollment', label: 'Accepteer inschrijving'},
	reject: {action:'removeenrollment', label: 'Keur inschrijving af'},
	pay: {action: 'payenrollment', label: 'Betaling inschrijving OK'},
	open: {action: 'open', label: 'Les open'},
	absentreq: {action: 'absentreq', label: 'Vraag afwezigheid aan'},
	absentok: {action: 'absentok', label: 'Wettelijk afwezig'},
	absentnok: {action: 'absentnok', label: 'Afwezig'},
	done: {action: 'done', label: 'Les OK'},
	removeenrollment: {action:'removeenrollment', label: 'Verwijder inschrijving'}
};
var LessonStatusses = {
	created: {key: "created", name: "Gemaakt", possibleActions: [LessonActions.accept, LessonActions.reject]},
	open: {key:"open", name: "Open", possibleActions: [LessonActions.absentreq, LessonActions.absentok, LessonActions.absentnok, LessonActions.done, LessonActions.removeenrollment]},
	done: {key: "done", name: "Les OK", possibleActions: [LessonActions.open]},
	absentreq: {key: "absentreq", name: "Afwezigheid aangevraagd", possibleActions: [LessonActions.absentok, LessonActions.absentnok]},
	absentok: {key: "absentok", name: "Wettelijk afwezig", possibleActions: [LessonActions.open, LessonActions.done]},
	absentnok: {key: "absentnok", name: "Afwezig", possibleActions: [LessonActions.open, LessonActions.done]}
};
//Kan dit niet beter?
var LessonStatussesArray = [LessonStatusses.created, LessonStatusses.open, LessonStatusses.done, LessonStatusses.absentreq, LessonStatusses.absentok, LessonStatusses.absentnok];

var LessonDropDownView = DropDownView.extend({
	initialize: function () {
		this.template = $("#lessonDropDownTemplate");
	},
	events: {
		"click .status": "changeStatus"
	},
	render: function() {
		this.constructor.__super__.render.apply(this);
	},
	renderInnerHTML: function(){
		var choicesArray =[];
		choicesArray = _.clone(LessonStatusses[this.options.lesson.get('status')].possibleActions);
		if (this.options.lesson.get('paid') == false) {
			choicesArray.push(LessonActions.pay);
		}
		var argumentHash = {
			student: allStudents.get(this.options.lesson.get("student")).toJSON(),
			teacher: allTeachers.get(this.options.lesson.get("teacher")).toJSON(),
			status: this.options.lesson.statusToDutch(), 
			choices: choicesArray
		};
		return Mustache.render(this.template.html(),argumentHash);
	},
	changeStatus: function(e){
		console.log("$(e.target).data('action') = " + $(e.target).data("action"));
		this.options.lesson.save({
				data: {action: $(e.target).data("action")}},{
				success: function(){
					moderator.reloadMainscreen();
				},
				error: function(model, response, options) {
					var errors = $.parseJSON(response.responseText).errors;
					alert('Fout: ' + errors);
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
})