var Teacher = Backbone.Model.extend({
	initialize: function(){
		//valideer of begin en einde tijd binnen schooltijd valt!
	},
	getTeachingTime: function(start_end, day){
		var hours = this.get(start_end + '_hours_' + day);
		var minutes = this.get(start_end + '_minutes_' + day);
		if (hours && hours != 0 ){return pad(hours,2) + ":" + pad(minutes, 2);}
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
		return (this.get('start_hours_'+ day) !== undefined  && this.get('start_hours_'+ day) != 0)
	},
	urlRoot: "/teachers",
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
		return this.get('firstname') + ' ' +  this.get('lastname');
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
		"click .addTeacher": "showAddTeacherScreen",
		"click #searchTeacher": "searchTeacher",
		"click .info": "showTeacherInfo"
	},
	tagName: "div",
	id: "accordion",
	render: function() {
		$(this.el).html(Mustache.to_html(this.options.template,{teachers: this.collection.models}));
		//$(this.el).find('.teachersBox').each(function() {$(this).button();});
		var icons = {
	      	header: "ui-icon-circle-arrow-e",
	      	activeHeader: "ui-icon-circle-arrow-s"
	    };
		$(this.el).find('#accordion').accordion({
			icons: icons,
			collapsible: true,
			active: false
		});

		$(this.el).find('.addTeacher').button({
			icons: {secondary: "ui-icon-circle-plus"}
		});
		$(this.el).find('#searchTeacher').button({
			icons: { primary: "ui-icon-search"},
		    text: false
		})

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
	showTeacherInfo: function(e){
		var id = $(e.currentTarget).data("id");
		var teacher = this.collection.get(id);
		moderator.setMainScreenShowTeacherDetails(teacher);
	},
	showAddTeacherScreen: function(e) {
		moderator.setMainScreenAddTeacher();
	},
	searchTeacher: function(e){
		var string = $(this.el).find('input[name=searchTeacher]').val();
		if (!this.originalCollection){
			this.originalCollection = this.collection;
		}
		if (string == ''){this.collection = this.originalCollection}
		else {
			this.collection = new Students();
			this.originalCollection.each( function(element, index, list){
				if (element.get('firstname').startsWith(string) || element.get('lastname').startsWith(string)) {
					this.collection.add(element);
				}
			}, this);
		}
		this.render();
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
			firstname: this.teacher.get('firstname'),
			lastname: this.teacher.get('lastname'),
			courses: this.teacher.getCourses(),
			periodOpenTime: period.getTime('open'),
			periodCloseTime: period.getTime('close'),
			bio: this.teacher.get('bio'),
			email: this.teacher.get('email'),
			phone: this.teacher.get('phone')
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
			if (!domElement.find('#' + element).prop('checked')) {
				teacher.setTeachingTime('start',element, "00:00");
				teacher.setTeachingTime('end',element, "00:00");
			}
			else {
				var start = domElement.find('#start_hours_' + element).valplace();
				var end = domElement.find('#end_hours_' + element).valplace();
				if (start == ''){start = "00:00"};
				if (end == ''){end = "00:00"};
				teacher.setTeachingTime('start', element, start);
				teacher.setTeachingTime('end',element, end);
			}
		});
		teacher.set('firstname', domElement.find('input[name=firstname]').valplace());
		teacher.set('lastname', domElement.find('input[name=lastname]').valplace());
		teacher.set('courses', domElement.find('input[name=courses]').valplace());
		teacher.set('bio', domElement.find('textarea[name=bio]').valplace());
		teacher.set('email', domElement.find('input[name=email]').valplace());
		teacher.set('phone', domElement.find('input[name=phone]').valplace());

		teacher.save({},{
			success: function (model, response, options) {
				allTeachers.set(teacher,{remove:false});
				moderator.showMainScreenTeacherIndex();
				if (('new_user' in response) && response.new_user == true) {
						moderator.showDialog('passwordDialog', {
							text: "Registratie gelukt! We hebben je het standaardpaswoord 'rockschool' gegeven.",
							user_id: model.get('user_id')
						})
					}
					else {
						moderator.showDialog('generalDialog', {
		        			title: "Succes",
		        			text: "Registratie gelukt!"
		        		});
					}
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

var TeacherShowDetailsView = Backbone.View.extend({
	events: {
		"click .submitButton":"editTeacher"
	},
	render:function(){
		var showPhone = false;
		var showEmail;
		if (current_user_role == "admin" || (current_user_role == "teacher" && current_user_id == this.teacher.user_id)){
			var showPhone = true;
		}
		if (current_user_role == "admin" || (current_user_role == "teacher" && current_user_id == this.teacher.user_id)){
			var showEmail = true;
		}
		var argumentHash = {
			firstname: this.teacher.get('firstname'),
			lastname: this.teacher.get('lastname'),
			courses: this.teacher.getCourses(),
			periodOpenTime: period.getTime('open'),
			periodCloseTime: period.getTime('close'),
			bio: this.teacher.get('bio'),
			phone: this.teacher.get('phone'),
			email: this.teacher.get('email'),
			showPhone: showPhone,
			showEmail: showEmail
		};
		var teacher = this.teacher;
		_.each(['monday','tuesday', 'wednesday', 'thursday', 'friday','saturday', 'sunday'], function(element, index, list){
			argumentHash[element+'StartTime'] = teacher.getTeachingTime('start', element);
			argumentHash[element+'EndTime'] = teacher.getTeachingTime('end', element);
			argumentHash[element+'Teaching'] = teacher.getTeachingDay(element);
		});

		$(this.el).html(Mustache.render(this.options.template.html(),argumentHash));
		$(this.el).find('.submitButton').button();
	},
	editTeacher: function(e){
		moderator.setMainScreenEditTeacher(this.teacher);
	}
})