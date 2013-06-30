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
				id: response.id
		};
	},
	statusToDutch: function() {
		var text;
		switch(this.attributes.status){
			case "created":
				text = "Gemaakt";
				break;
			case "open":
				text = "Open";
				break;
			case "ok":
				text = "OK";
				break;
			default:
				text = "???";
		}
		return text;
	}
});
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
		return Mustache.render(this.template.html(),{
			student: allStudents.get(this.options.lesson.get("student")).toJSON(),
			teacher: allTeachers.get(this.options.lesson.get("teacher")).toJSON(),
			status: this.options.lesson.statusToDutch()
		});
	},
	changeStatus: function(e){
		console.log("$(e.target).data('status') = " + $(e.target).data("status"));
		this.options.lesson.save(
			{status: $(e.target).data("status")},{
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
