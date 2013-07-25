OptionsView = Backbone.View.extend({
	events: {
		"click #options-period" : "showPeriodOptions",
		"click #options-closingperiods": "showClosingPeriodsOptions",
		"click #lessonsSearch" : "showLessonsSearch",
		"click #enrollmentsSearch" : "showEnrollmentsSearch"
	},
	render: function() {
		$(this.el).html(this.options.template);
		$(this.el).find('.optionsBox').each(function() {$(this).button()});
		return this;
	},
	showPeriodOptions: function() {
		moderator.showPeriodOptions();
	},
	showClosingPeriodsOptions: function() {
		moderator.showClosingPeriodsOptions();
	},
	showLessonsSearch: function() {
		moderator.showLessonsSearch();
	},
	showEnrollmentsSearch: function(){
		moderator.showEnrollmentsSearch();
	}
});

