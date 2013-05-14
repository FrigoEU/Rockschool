var Lesson = Backbone.Model.extend({
	defaults: {
		startTime: (new Date()),
		length: standardLessonLength,
		teacher: 1,
		student: 1
	},
	initialize: function() {
		// this.startTime.setMilliseconds(0);
		// this.startTime.setSeconds(0);
	}
})

