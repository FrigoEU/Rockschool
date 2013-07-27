var ClosingPeriod = Backbone.Model.extend({
	urlRoot: "/closing_periods",
	parse: function(response) {
		var enddate = new Date(response.enddate);
		var startdate = new Date(response.startdate);
		return {
			enddate: enddate,
			startdate: startdate,
			id: response.id
		}
	},
	getStartDate: function(){
		return this.get('startdate').toString('dd/MM/yyyy')
	},
	getEndDate: function(){
		return this.get('enddate').toString('dd/MM/yyyy')
	},
	hasInside: function(date){
		var comparingDate = new Date(this.get('startdate'));
		while (comparingDate <= this.get('enddate')) {
			if (date.toString('dd/MM/yyyy') == comparingDate.toString('dd/MM/yyyy')) { return true}
			comparingDate.add({days: 1});
		}
		return false;
	}
});
var ClosingPeriods = Backbone.Collection.extend({
	model: ClosingPeriod,
	url: "/closing_periods",
	hasInside: function(date){
		var result = false;
		this.each(function(element, index, list){
			if (element.hasInside(date)){
				result = true;
			}
		}, this);
		return result;
	}
});
var ClosingPeriodsOptionsView = Backbone.View.extend({
	initialize: function () {},
	events: {
		"click .deleteButton": "deleteClosingPeriod",
		"click .submitButton": "addClosingPeriod"
	},
	render: function(){
		this.collection = allClosingPeriods;
		
		$(this.el).html(Mustache.to_html(this.options.template,{closingPeriods: this.collection.models})); 
		$('.deleteButton').button();
		$('.submitButton').button();
		$('.datepicker').datepicker({"dateFormat": "dd/mm/yy"});
	},
	addClosingPeriod: function(e){
		e.preventDefault();
		var self = this;
		console.log(Date.parse($(this.el).find('input[name=startDate]').val()));
		console.log($(this.el).find('input[name=startDate]').val());
		this.collection.create({
					startdate: Date.parse($(this.el).find('input[name=startDate]').val()).toString('yyyy-MM-dd'),
					enddate: Date.parse($(this.el).find('input[name=endDate]').val()).toString('yyyy-MM-dd')
				},{
			success: function(model, response, options){
				self.render();
				moderator.showDialog('generalDialog', {
					title: "Vakantieperiode toegevoegd",
					text: "Gelukt, de vakantieperiode is toegevoegd."
				});
			},
			error: function(model, response, options){
				standardHTTPErrorHandling(model, response, options);
				self.collection.remove(model);
			}
		});
	},
	deleteClosingPeriod: function(e){
		e.preventDefault();
		var self = this;
		this.collection.get($(e.currentTarget).data("closingperiodid")).destroy({
			success: function(model, response, options){
				self.render();
				moderator.showDialog('generalDialog', {
					title: "Vakantieperiode verwijderd",
					text: "Gelukt, de vakantieperiode is verwijderd."
				});
			},
			error: function(model, response, options){
				standardHTTPErrorHandling(model, response, options);
			}
		});

	}
});