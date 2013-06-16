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
	parse: function (response) {
		return {
			beginDate: Date.parse(USDateToEU(response[0].startdate)),
			endNormalEnrollmentsDate: Date.parse(USDateToEU(response[0].enddate)),
			openingTimeHours: response[0].openinghours,
			openingTimeMinutes: response[0].openingminutes,
			closingTimeHours: response[0].closinghours,
			closingTimeMinutes: response[0].closingminutes,
			openOnMonday: response[0].open_on_monday,
			openOnTuesday: response[0].open_on_tuesday,
			openOnWednesday: response[0].open_on_wednesday,
			openOnThursday: response[0].open_on_thursday,
			openOnFriday: response[0].open_on_friday,	
			openOnSaturday: response[0].open_on_saturday,
			openOnSunday: response[0].open_on_sunday,
			openForEnrollment: response[0].open_for_registration
		};
	}
});

function USDateToEU (USDate) {
	return (USDate.substring(8,10) + '/' + USDate.substring(5,7) + '/' + USDate.substring(0,4))
}

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
			"startTime": pad(period.get("openingTimeHours"), 2) + ":" + pad(period.get("openingTimeMinutes"),2),
			"endTime": pad(period.get("closingTimeHours"), 2) + ":" + pad(period.get("closingTimeMinutes"),2),
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
			openForEnrollment: $(this.el).find('input[name=openForEnrollment]').is(':checked')
		});
		period.save();
		moderator.setMainScreenOptions();
	}
});

