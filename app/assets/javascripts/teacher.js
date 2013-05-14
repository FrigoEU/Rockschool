var Teacher = Backbone.Model.extend({
	initialize: function(){

	},
	getSchedule: function(startDate, endDate){
		//Hier moeten we dus naar de server gaan om de schedule van een bepaalde week op te halen.
		//Wat we hier gaan terug krijgen is normaal een array van lesson objecten, in JSON formaat.
		//Ik kan hier dus wel een dummy doorgeven om verder te kunnen.
		//Afspraak: Lege lessen geeft de server NIET door. Ik moet dus maar enkele lessen doorgeven om een goeie test te hebben.

		var resultSchedule = new Schedule();
		resultSchedule.meta("startDate", new Date(startDate));
		resultSchedule.meta("endDate", new Date(endDate));
		resultSchedule.meta("teacher", this);

		//this.fillScheduleTest(resultSchedule, numberOfDays, new Date(startDate), new Date(endDate));

		var startDateTimeStamp = +new Date(startDate)/1000;
		var endDateTimeStamp = +new Date(endDate)/1000;

		resultSchedule.fetch({
			data: {'id': this.id, 'startDate': startDateTimeStamp, 'endDate': endDateTimeStamp},
			async:false
		});

		//console.log("Teacher.getSchedule.resultSchedule = ", resultSchedule);
		return resultSchedule;

	},

	fillScheduleTest: function(schedule, numberOfDays, startDate, endDate){
		//Gewoon testprocedure o; een paar lessen te maken

		var lesson;
		var lessonDate;

		for (var i = 0; i <= numberOfDays ; i++) {
			lessonDate = new Date(startDate);
			lessonDate.add({days: i, hours: 15, minutes: 0});

			lesson = new Lesson({
				teacher: "Gunther",
				student: "Maja",
				duration: 30,
				startTime: lessonDate
			});

			schedule.add(lesson);
		};


	},

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
		"click .teacherSchedule": "showTeacherSchedule",
		"click .teacherDetails" : "showTeacherDetails",
		"click .addTeacher": "showAddTeacherScreen"
	},
	tagName: "div",
	id: "accordion",
	render: function() {
		$(this.el).html(Mustache.to_html(this.options.template,{teachers: this.collection.toJSON()})); 
		$(this.el).children("div#accordion").accordion({collapsible: true});
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

var AddTeacherView = Backbone.View.extend({
	events: {
		"click .submitButton": "submit"

	},
	tagName: "div",
	id: "addteacherview",
	render: function () {
		$(this.el).html(this.options.template.html());
		$(this.el).find("button.submitButton").button();
		return this;
	},
	submit: function(e) {
		e.preventDefault();

		allTeachers.create({
            name: this.$('input[name=name]').val()
        });
        moderator.setMainScreenTeacherIndex();
	}
})
