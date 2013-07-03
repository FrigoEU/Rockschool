OptionsView = Backbone.View.extend({
	events: {
		"click #options-period" : "showPeriodOptions",
		"click #lessonsSearch" : "showLessonsSearch"
	},
	render: function() {
		$(this.el).html(this.options.template);
		$(this.el).find('.optionsBox').each(function() {$(this).button()});
		return this;
	},
	showPeriodOptions: function() {
		moderator.showPeriodOptions();
	},
	showLessonsSearch: function() {
		moderator.showLessonsSearch();
	}
});

