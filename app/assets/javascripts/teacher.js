var Teacher = Backbone.Model.extend({
	initialize: function(){
		//valideer of begin en einde tijd binnen schooltijd valt!
	},
	url: "/teachers",
	defaults: {
		name: "Nieuwe Leerkracht",
		startTimeHours: 12,
		startTimeMinutes: 0,
		endTimeHours: 18,
		endTimeMinutes: 0,
		teachingOnMonday: true,
		teachingOnTuesday: true,
		teachingOnWednesday: true,
		teachingOnThursday: true,
		teachingOnFriday: true,
		teachingOnSaturday: false,
		teachingOnSunday: false
	},
	parse: function (response) {
		return {
			id: response.id,
			name: response.name,
			startTimeHours: response.starttimehours,
			startTimeMinutes: response.starttimeminutes,
			endTimeHours: response.endtimehours,
			endTimeMinutes: response.endtimeminutes,
			teachingOnMonday: response.teachingonmonday,
			teachingOnTuesday: response.teachingontuesday,
			teachingOnWednesday: response.teachingonwednesday,
			teachingOnThursday: response.teachingonthursday,
			teachingOnFriday: response.teachingonfriday,
			teachingOnSaturday: response.teachingonsaturday,
			teachingOnSunday: response.teachingonsunday
		};
	},
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
	setStartTime: function(s) {
		this.attributes.startTimeHours = parseInt(s.substring(0,2), 10);
		this.attributes.startTimeMinutes = parseInt(s.substring(3,5), 10);
	},
	setEndTime: function(s) {
		this.attributes.endTimeHours = parseInt(s.substring(0,2), 10);
		this.attributes.endTimeMinutes = parseInt(s.substring(3,5), 10);
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
		'click .submitButton': 'submit'
	},
	tagName: "div",
	id: "addteacherview",
	render: function () {
		//$(this.el).off('click');
		$(this.el).html(Mustache.to_html(this.options.template.html(), {
			"name": this.model.get("name"),
			"startTime": this.model.startTime(),
			"endTime": this.model.endTime(),
			"monday": this.model.get("teachingOnMonday"),
			"tuesday": this.model.get("teachingOnTuesday"),
			"wednesday": this.model.get("teachingOnWednesday"),
			"thursday": this.model.get("teachingOnThursday"),
			"friday": this.model.get("teachingOnFriday"),
			"saturday": this.model.get("teachingOnSaturday"),
			"sunday": this.model.get("teachingOnSunday")
		}));
		$(this.el).find("button.submitButton").button();

		return this;
	},
	submit: function(e) {
		e.preventDefault();
		this.model.setStartTime($(this.el).find('input[name=startTime]').val());
		this.model.setEndTime($(this.el).find('input[name=endTime]').val());
		this.model.set("teachingOnMonday", $(this.el).find('input#monday').is(':checked'));
		this.model.set("teachingOnTuesday", $(this.el).find('input#tuesday').is(':checked'));
		this.model.set("teachingOnWednesday", $(this.el).find('input#wednesday').is(':checked'));
		this.model.set("teachingOnThursday", $(this.el).find('input#thursday').is(':checked'));
		this.model.set("teachingOnFriday", $(this.el).find('input#friday').is(':checked'));
		this.model.set("teachingOnSaturday", $(this.el).find('input#saturday').is(':checked'));
		this.model.set("teachingOnSunday", $(this.el).find('input#sunday').is(':checked'));

		this.model.save({"name": $(this.el).find('input[name=name]').val()},{
			success: function (model, response, options) {
				allTeachers.add(model);
				moderator.showMainScreenTeacherIndex();
			}
		});
	}
});

var TeacherTeachingDropDownView = DropDownView.extend({
	initialize: function () {
		this.template = $("#teacherTeachingDropDownTemplate");
	},
	events: {
		"click .enroll": "showEnrollmentDialog"
	},
	render: function() {
		this.constructor.__super__.render.apply(this);
	},
	showEnrollmentDialog: function(e) {
		e.preventDefault();
		$(this).remove();

		var student = allStudents.get(1);//Tijdelijk!
		var teacher = allTeachers.get($("#lessenrooster").data("teacher-id"));

		var startTime = this.options.scheduleViewItem.startTime;
		var duration = this.options.scheduleViewItem.duration;

		moderator.showEnrollmentDialog(student, teacher, startTime, duration);
	},
	renderInnerHTML: function(){
		return this.template.html();
	}
});

