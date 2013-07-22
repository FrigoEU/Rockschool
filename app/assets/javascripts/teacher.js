var Teacher = Backbone.Model.extend({
	initialize: function(){
		//valideer of begin en einde tijd binnen schooltijd valt!
	},
	getTeachingTime: function(start_end, day){
		var hours = this.get(start_end + '_hours_' + day);
		var minutes = this.get(start_end + '_minutes_' + day);
		if (hours && minutes && hours != 0 && minutes != 0){return pad(hours,2) + ":" + pad(minutes, 2);}
		else {return '';}
	},
	getTeachingTimeHash: function(start_end, day){
		var hours = this.get(start_end + '_hours_' + day);
		var minutes = this.get(start_end + '_minutes_' + day);
		return {
			hours: hours,
			minutes: minutes
		}
	},
	setTeachingTime: function(start_end, day, time){
		// 8:30
		var splitted = time.split(":");

		this.set(start_end + '_hours_' + day, parseInt(splitted[0]));
		this.set(start_end + '_minutes_' + day, parseInt(splitted[1]));
	},
	getTeachingDay: function(day){
		return (this.get('start_hours_'+ day) !== undefined)
	},
	urlRoot: "/teachers",
	// defaults: {
	// 	name: "Nieuwe Leerkracht",
	// 	startTimeHours: 12,
	// 	startTimeMinutes: 0,
	// 	endTimeHours: 18,
	// 	endTimeMinutes: 0,
	// 	teachingOnMonday: true,
	// 	teachingOnTuesday: true,
	// 	teachingOnWednesday: true,
	// 	teachingOnThursday: true,
	// 	teachingOnFriday: true,
	// 	teachingOnSaturday: false,
	// 	teachingOnSunday: false
	// },
	// parse: function (response) {
	// 	return {
	// 		id: response.id,
	// 		name: response.name,
	// 		startTimeHours: response.starttimehours,
	// 		startTimeMinutes: response.starttimeminutes,
	// 		endTimeHours: response.endtimehours,
	// 		endTimeMinutes: response.endtimeminutes,
	// 		teachingOnMonday: response.teachingonmonday,
	// 		teachingOnTuesday: response.teachingontuesday,
	// 		teachingOnWednesday: response.teachingonwednesday,
	// 		teachingOnThursday: response.teachingonthursday,
	// 		teachingOnFriday: response.teachingonfriday,
	// 		teachingOnSaturday: response.teachingonsaturday,
	// 		teachingOnSunday: response.teachingonsunday
	// 	};
	// },
	showSchedule: function(startDate, endDate){
		//Hier moeten we dus naar de server gaan om de schedule van een bepaalde week op te halen.
		//Wat we hier gaan terug krijgen is normaal een array van lesson objecten, in JSON formaat.
		//Ik kan hier dus wel een dummy doorgeven om verder te kunnen.
		//Afspraak: Lege lessen geeft de server NIET door. Ik moet dus maar enkele lessen doorgeven om een goeie test te hebben.

		var resultSchedule = new Schedule();
		resultSchedule.meta("startDate", new Date(startDate));
		resultSchedule.meta("endDate", new Date(endDate));
		resultSchedule.meta("teacher", this);

		var startDateTimeStamp = +new Date(startDate)/1000;
		var endDateTimeStamp = +new Date(endDate)/1000;

		resultSchedule.fetch({
			data: {'teacher_id': this.id, 'startDate': startDateTimeStamp, 'endDate': endDateTimeStamp},
			success: function(model, response, options){
				resultSchedule.parse(response);
				moderator.showMainScreenTeacherSchedule(resultSchedule);
			},
			error: function(model, response, options){
				standardHTTPErrorHandling(model, response, options);
			}
		});

		//console.log("Teacher.getSchedule.resultSchedule = ", resultSchedule);
		return resultSchedule;
	},
	startTime: function() {
		return (pad(this.attributes.startTimeHours,2) + ":" + pad(this.attributes.startTimeMinutes,2));
	},
	endTime: function() {
		return (pad(this.attributes.endTimeHours,2) + ":" + pad(this.attributes.endTimeMinutes,2));
	},
	getName: function(){
		return this.get('name');
	},
	getCourses: function(){
		return this.get('courses');
	}
});

Backbone.Model.prototype.setByName = function(key, value, options) {
	var setter = {};
	setter[key] = value;
	this.set(setter, options);
};

var Teachers = Backbone.Collection.extend({
	model: Teacher,
	url: "/teachers"
});

var TeachersIndexView = Backbone.View.extend({
	events: {
		"click .teacher": "showTeacherSchedule",
		"click .addTeacher": "showAddTeacherScreen"
	},
	tagName: "div",
	id: "accordion",
	render: function() {
		$(this.el).html(Mustache.to_html(this.options.template,{teachers: this.collection.toJSON()}));
		$(this.el).find('.teachersBox').each(function() {$(this).button();});

		if (this.collection.length == 1){
			moderator.setMainScreenTeacherSchedule(this.collection.at(0));
		}
		return this;
	},
	showTeacherSchedule: function(e) {
		var id = $(e.currentTarget).data("id");
		var teacher = this.collection.get(id);
		moderator.setMainScreenTeacherSchedule(teacher);
	},
	showAddTeacherScreen: function(e) {
		moderator.setMainScreenAddTeacher();
	}
});

var TeacherDetailsView = Backbone.View.extend({
	events: {
		'click .submitButton': 'submit',
		'click input[type="checkbox"]': 'clickCheckbox'
	},
	tagName: "div",
	id: "teacherDetails",
	render: function () {
		if (this.teacher === undefined){this.teacher = new Teacher();}
		
		var argumentHash = {
			teacherName: this.teacher.getName(),
			teacherCourses: this.teacher.getCourses(),
			periodOpenTime: period.getTime('open'),
			periodCloseTime: period.getTime('close')
		};
		var teacher = this.teacher;
		_.each(['monday','tuesday', 'wednesday', 'thursday', 'friday','saturday', 'sunday'], function(element, index, list){
			argumentHash[element+'StartTime'] = teacher.getTeachingTime('start', element);
			argumentHash[element+'EndTime'] = teacher.getTeachingTime('end', element);
			argumentHash[element+'Teaching'] = teacher.getTeachingDay(element);
		});



		$(this.el).html(Mustache.render(this.options.template.html(),argumentHash));
		$(this.el).find("button.submitButton").button();

		return this;
	},
	submit: function(e) {
		e.preventDefault();

		var teacher = this.teacher;
		var domElement = $(this.el);
		_.each(['monday','tuesday', 'wednesday', 'thursday', 'friday','saturday', 'sunday'], function(element, index, list){
			var start = domElement.find('#start_hours_' + element).val();
			var end = domElement.find('#end_hours_' + element).val();
			if (start == ''){start = "00:00"};
			if (end == ''){end = "00:00"};
			teacher.setTeachingTime('start', element, start);
			teacher.setTeachingTime('end',element, end);
		});
		teacher.set('name', domElement.find('input[name=name]').val());
		teacher.set('courses', domElement.find('input[name=courses]').val());
		teacher.set('bio', domElement.find('textarea[name=bio]').val());

		teacher.save({},{
			success: function (model, response, options) {
				allTeachers.set(teacher,{remove:false});
				moderator.showDialog('generalDialog', {
	        			title: "Succes",
	        			text: "Registratie gelukt!"
	        		})
				moderator.showMainScreenTeacherIndex();
			},
			error: function(model, response, options){
				standardHTTPErrorHandling(model, response, options);
			}
		});
	},
	clickCheckbox: function(e){
		var timeboxes = $('.timeInput' + e.currentTarget.id);
		timeboxes.each(function(index){
			$(this).fadeToggle();
		})
	}
});

var TeacherTeachingDropDownView = DropDownView.extend({
	initialize: function () {
		this.template = $("#teacherTeachingDropDownTemplate");
	},
	events: {
		"click .enroll": "showEnrollmentDialog",
		"click .makeLessongroup": "showLessongroupDialog"
	},
	render: function() {
		this.constructor.__super__.render.apply(this);
	},
	showEnrollmentDialog: function(e) {
		this.showDialog(e, "enrollmentDialog");
	},
	showLessongroupDialog: function(e) {
		this.showDialog(e, "newlessongroupDialog");
	},
	showDialog: function(e, dialog){
		e.preventDefault();
		$(this).remove();
		var student = allStudents.get(1);//Tijdelijk!
		var teacher = allTeachers.get($("#lessenrooster").data("teacher-id"));

		var startTime = this.options.scheduleViewItem.startTime;
		var duration = this.options.scheduleViewItem.duration;
		var options = {'student': student, 'teacher':teacher, 'startTime': startTime, 'duration': duration, 'lessongroup_id': undefined};
		moderator.showDialog(dialog, options);
	},
	renderInnerHTML: function(){
		return this.template.html();
	}
});

