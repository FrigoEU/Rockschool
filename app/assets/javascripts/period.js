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
			beginDate: Date.parse(USDateToEU(response.startdate)),
			endNormalEnrollmentsDate: Date.parse(USDateToEU(response.enddate)),
			openingTimeHours: response.openinghours,
			openingTimeMinutes: response.openingminutes,
			closingTimeHours: response.closinghours,
			closingTimeMinutes: response.closingminutes,
			openOnMonday: response.open_on_monday,
			openOnTuesday: response.open_on_tuesday,
			openOnWednesday: response.open_on_wednesday,
			openOnThursday: response.open_on_thursday,
			openOnFriday: response.open_on_friday,	
			openOnSaturday: response.open_on_saturday,
			openOnSunday: response.open_on_sunday,
			openForEnrollment: response.open_for_registration
		};
	},
	getTime: function(open_close){
		var key = open_close;
		if (open_close == 'close'){key = 'clos'}
		return pad(this.get(key + 'ingTimeHours'),2) + ":" + pad(this.get(key + 'ingTimeMinutes'), 2);
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
			beginDate: Date.parse($(this.el).find('input[name=beginDate]').val()).toString('yyyy-MM-dd'),
			endNormalEnrollmentsDate: Date.parse($(this.el).find('input[name=endNormalEnrollmentsDate]').val()).toString('yyyy-MM-dd'),
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
		period.save(null,{
			success:function(model, response, options){
				moderator.setMainScreenOptions();
				moderator.showDialog('generalDialog',{
					title: "Periode opgeslagen",
					text: "De periode die je hebt geregistreerd is succesvol opgeslagen. Deze periode is meteen actief."
				})
			},
			error: function(model, response, options){
				standardHTTPErrorHandling(model, response, options);
			}
		});
		
	}
});

