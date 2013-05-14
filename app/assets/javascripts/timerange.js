var TimeRange = Backbone.Model.extend({
	defaults: {
		startTime: (new Date()),
		duration: standardLessonLength,
		type: ""
	},
	initialize: function() {
	}
})