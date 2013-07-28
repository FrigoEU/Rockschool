class PeriodsController < ApplicationController
	include ApplicationHelper
	# GET /periods
    # GET /periods.json
    include PeriodsHelper
	def index
		if params[:active] == "true"
  			@activePeriod = Period.where({active: true}).first
  		end 
  		respond_to do |format|
      		format.html # index.html.erb
      		format.json { render json: @activePeriod }
      	end
	end

	def create
		get_current_user
		return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin
		
		Period.update_all({active: false}, {active: true})

		@beginDateParsed = jsdate_to_railsdate(params[:beginDate])
      	@endNormalEnrollmentsDate = jsdate_to_railsdate(params[:endNormalEnrollmentsDate])  

		@newPeriod = Period.new({
			closinghours: params[:closingTimeHours].to_i, 
			closingminutes: params[:closingTimeMinutes].to_i, 
			enddate: @endNormalEnrollmentsDate,
			open_for_registration: params[:openForEnrollment],
			open_on_friday: params[:openOnFriday],
			open_on_monday: params[:openOnMonday],
			open_on_saturday: params[:openOnSaturday],
			open_on_sunday: params[:openOnSunday],
			open_on_thursday: params[:openOnThursday],
			open_on_tuesday: params[:openOnTuesday],
			open_on_wednesday: params[:openOnWednesday],
			openinghours: params[:openingTimeHours].to_i, 
			openingminutes: params[:openingTimeMinutes].to_i, 
			startdate: @beginDateParsed,
			active: true
			})
		if @newPeriod.save
      		render json: @newPeriod
      	else
      		render json: {:errors => @newPeriod.errors.full_messages}, status: :unprocessable_entity 
      	end
	end
	
end
