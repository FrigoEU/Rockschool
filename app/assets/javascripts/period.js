Period = Backbone.Model.extend({
	url: "/periods",
	defaults: {
		beginDate: (new Date()),
		endNormalEnrollmentsDate: (new Date()),
		openingTimeHours: 12,
		openingTimeMinutes: 0,
		closingTimeHours: 21,
		closingTimeMinutes: 0,
		openOnMonday: true,
		openOnTuesday: true,
		openOnWednesday: true,
		openOnThursday: true,
		openOnFriday: true,	
		openOnSaturday: false,
		openOnSunday: false,
		openForEnrollment: true
	},
});

PeriodOptionsView = Backbone.View.extend({
	events: {
		'click .submitButton': 'submit'
	},
	tagName: "div",
	id: "",
	render: function () {
		$(this.el).html(Mustache.to_html(this.options.template,{
			"startDate": period.get("beginDate").toString('dd/MM/yyyy'),
			"endNormalEnrollmentsDate": period.get("endNormalEnrollmentsDate").toString('dd/MM/yyyy'),
			"monday": period.get("openOnMonday"),
			"tuesday": period.get("openOnTuesday"),
			"wednesday": period.get("openOnWednesday"),
			"thursday": period.get("openOnThursday"),
			"friday": period.get("openOnFriday"),
			"saturday": period.get("openOnSaturday"),
			"sunday": period.get("openOnSunday"),
			"startTime": period.get("openingTimeHours") + ":" + pad(period.get("openingTimeMinutes"),2),
			"endTime": period.get("closingTimeHours") + ":" + pad(period.get("closingTimeMinutes"),2),
			"active":  period.get("openForEnrollment")
		}));
		$(this.el).find(".datepicker").datepicker({"dateFormat": "dd/mm/yy"});
  	},
	submit: function(e) {
		e.preventDefault();

		period = new Period({
			beginDate: Date.parse($(this.el).find('input[name=beginDate]').val()),
			endNormalEnrollmentsDate: Date.parse($(this.el).find('input[name=endNormalEnrollmentsDate]').val()),
			openingTimeHours: parseInt($(this.el).find('input[name=startTime]').val().substring(0,2)),
			openingTimeMinutes: parseInt($(this.el).find('input[name=startTime]').val().substring(3,5)),
			closingTimeHours: parseInt($(this.el).find('input[name=endTime]').val().substring(0,2)),
			closingTimeMinutes: parseInt($(this.el).find('input[name=endTime]').val().substring(3,5)),
			openOnMonday: $(this.el).find('input#monday').is(':checked'),
			openOnTuesday: $(this.el).find('input#tuesday').is(':checked'),
			openOnWednesday: $(this.el).find('input#wednesday').is(':checked'),
			openOnThursday: $(this.el).find('input#thursday').is(':checked'),
			openOnFriday: $(this.el).find('input#friday').is(':checked'),
			openOnSaturday: $(this.el).find('input#saturday').is(':checked'),
			openOnSunday: $(this.el).find('input#sunday').is(':checked'),
			openForEnrollment: $(this.el).find('input[name=endTime]').is(':checked')
		});
		period.save();
		//moderator.setMainScreenOptions();
	}
});

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}