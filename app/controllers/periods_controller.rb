class PeriodsController < ApplicationController
	# GET /periods
    # GET /periods.json
    include PeriodsHelper
	def index
		if params[:active] == true
  			@activePeriod = Period.where({active: true})
  		end
  		respond_to do |format|
      		format.html # index.html.erb
      		format.json { render json: @activePeriod }
      	end
	end

	def create
		Period.update_all "active = 'false'", "active = 'true'"

		@beginDateParsed = Time.at(params[:beginDate].to_f/1000)
      	@endNormalEnrollmentsDate = Time.at(params[:endNormalEnrollmentsDate].to_f/1000)  

		@newPeriod = Period.create({
			closinghours: params[:closingTimeHours].to_i, 
			closingminutes: params[:closingTimeMinutes].to_i, 
			enddate: @endNormalEnrollmentsDate,
			open_for_registration: to_boolean(params[:openForEnrollment]),
			open_on_friday: to_boolean(params[:openOnFriday]),
			open_on_monday: to_boolean(params[:openOnMonday]),
			open_on_saturday: to_boolean(params[:openOnSaturday]),
			open_on_sunday: to_boolean(params[:openOnSunday]),
			open_on_thursday: to_boolean(params[:openOnThursday]),
			open_on_tuesday: to_boolean(params[:openOnTuesday]),
			open_on_wednesday: to_boolean(params[:openOnWednesday]),
			openinghours: params[:openingTimeHours].to_i, 
			openingminutes: params[:openingTimeMinutes].to_i, 
			startdate: @beginDateParsed,
			active: true
			})
		respond_to do |format|
      		format.html # index.html.erb
      		format.json { render json: @newPeriod }
      	end
	end
	
end
