class ClosingPeriodsController < ApplicationController
	include ApplicationHelper

	def index
		@closing_periods = Closingperiod.order("startdate ASC")
	    render json: @closing_periods.to_json 
	end
	
	def create
		get_current_user
		return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

		@closing_period = Closingperiod.new(params[:closing_period])

	    if @closing_period.save
	      render json: @closing_period, status: :created, location: @teacher 
	    else
	      render json: {errors: @closing_period.errors.full_messages}, status: :unprocessable_entity 
	    end
	end

	def destroy
		get_current_user
		return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

	    @closing_period = Closingperiod.find(params[:id])
	    @closing_period.destroy
	    head :no_content 
  end
end
