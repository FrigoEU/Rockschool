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
	}
});
var ClosingPeriods = Backbone.Collection.extend({
	model: ClosingPeriod,
	url: "/closing_periods"
});
var ClosingPeriodsOptionsView = Backbone.View.extend({
	initialize: function () {},
	events: {
		"click .deleteButton": "deleteClosingPeriod",
		"click .submitButton": "addClosingPeriod"
	},
	render: function(){
		if (!this.collection) {
			this.collection = new ClosingPeriods();
			var self = this;
			this.collection.fetch({
				success: function(collection, response, options){
					self.render();
				},
				error: function(collection, response, options){
					standardHTTPErrorHandling(collection, response, options);
				}
			});
		}			
		
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