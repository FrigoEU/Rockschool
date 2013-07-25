class ClosingPeriodsController < ApplicationController
	def index
		@closing_periods = Closingperiod.order("startdate ASC")
	    render json: @closing_periods.to_json 
	end
	
	def create
		@closing_period = Closingperiod.new(params[:closing_period])

	    if @closing_period.save
	      render json: @closing_period, status: :created, location: @teacher 
	    else
	      render json: {errors: @closing_period.errors.full_messages}, status: :unprocessable_entity 
	    end
	end

	def destroy
	    @closing_period = Closingperiod.find(params[:id])
	    @closing_period.destroy
	    head :no_content 
  end
end
