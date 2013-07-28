class LessongroupsController < ApplicationController
	include ApplicationHelper

	def create
		#unless argumentok?(params, :teacher) && argumentok?(params, :type) && argumentok?(params, :startTime) && argumentok?(params, :duration) && argumentok?(params, :maxNumberOfStudents)
		#	raise ArgumentException, "Incorrect parameters to make a new lessongroup"
		#end
		get_current_user
		return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

		@maximum_number_of_students = params[:maxNumberOfStudents].to_i
		@teacher = Teacher.find(params[:teacher][:id].to_i)
		@duration = params[:duration].to_i
		@starttime = Time.parse(params[:startTime])
		@type = params[:type]

		@lessongroup = Lessongroup.new({
				teacher: @teacher,
				type: @type,
				starttime: @starttime,
				duration: @duration,
				maximum_number_of_students: @maximum_number_of_students
			})
		@lessons = @lessongroup.lessons
		get_current_user
		@lessons.each do
			|lesson|
			authorized = lesson.authorized?(@current_user)
	        lesson.retrieve_virtual_attributes(authorized)
	        lesson.adapt_status_to_authorization(authorized) 
		end
		if @lessongroup.save
			respond_to do |format|
					format.json{ render json:{lessongroup: @lessongroup, :lessons => @lessongroup.lessons}, status: :created }
				end
		else
			respond_to do |format|
					format.json{ render json:{:errors => @lessongroup.errors.full_messages}, status: :unprocessable_entity }
				end
		end
	end
	def destroy
	    get_current_user
	    return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

	    @lessongroup = Lessongroup.find(params[:id])
	    @lessongroup.destroy
	    head :no_content 
	end
end
