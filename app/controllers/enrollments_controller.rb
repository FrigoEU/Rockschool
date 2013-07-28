class EnrollmentsController < ApplicationController
	include ApplicationHelper

	def create
		unless argumentok?(params, :lessongroup_id) || (argumentok?(params, :teacher) && argumentok?(params, :type) && argumentok?(params, :startTime) && argumentok?(params, :duration))
			raise ArgumentException, "Enrollments need either an existing lessongroup or a teacher, type, starttime and duration"
		end

		unless argumentok?(params, :student)
			raise ArgumentException, "Enrollments need a student"
		end

		#startTimeParsed = Time.at(params[:startTime].to_f)
		@lessongroup = Lessongroup.find(params[:lessongroup_id].to_i) if argumentok?(params, :lessongroup_id)
		@student = Student.find(params[:student][:id].to_i) if argumentok?(params, :student)
		@teacher = Teacher.find(params[:teacher][:id].to_i) if argumentok?(params, :teacher)
		@duration = params[:duration].to_i if argumentok?(params, :duration)
		@starttime = Time.parse(params[:startTime])
		@type = params[:type]

		if @lessongroup.nil?
			@lessongroup = Lessongroup.new({
				teacher: @teacher,
				type: @type,
				starttime: @starttime,
				duration: @duration,
				maximum_number_of_students: 1
			 })
		end
		if not @lessongroup.errors.empty?
			return render json:{:errors => @lessongroup.errors.full_messages}, status: :unprocessable_entity 
		end

		if @lessongroup.save
		else
			return render json:{:errors => @lessongroup.errors.full_messages}, status: :unprocessable_entity 
		end

		@enrollment = @lessongroup.enrollments.build({
			student_id: @student.id,
			paid: false,
			approved: false
		})
		if not @lessongroup.valid? #om validaties op max_number_of_students enzo te doen
			return render json:{:errors => @lessongroup.errors.full_messages}, status: :unprocessable_entity 
		end
		if @enrollment.save
			lessons = @lessongroup.lessons
			get_current_user
			lessons.each  do 
			  |lesson|
			  authorized = true
			  lesson.retrieve_virtual_attributes(authorized)
			  lesson.adapt_status_to_authorization(authorized)
			end
			render json: {:enrollment => @enrollment, :lessongroup => @lessongroup, :lessons => lessons}, status: :created 
		else
			render json: {errors: @enrollment.errors}, status: :unprocessable_entity
		end
	end
	def index
		if params.has_key?(:lessongroup_id)
			@enrollments = Enrollment.where("lessongroup_id = ?",params[:lessongroup_id])
			@enrollments.each{|enrollment|enrollment.retrieve_virtual_attributes}
			respond_to do |format|
		      format.html 
		      format.json { render json: @enrollments.to_json }
		    end
		end
		if params.has_key?(:student_id)
			@student = Student.find(params[:student_id])
			@enrollments = @student.enrollments
			@enrollments.each{|enrollment|enrollment.retrieve_virtual_attributes}
			respond_to do |format|
		      format.html 
		      format.json { render json: @enrollments.to_json }
		    end
		end
		if params.has_key?(:inquirystatus) && (params[:inquirystatus] == "unpaid" || params[:inquirystatus] == "unapproved")
			if params[:inquirystatus] == "unpaid"		
				@enrollments = Enrollment.where('paid = ?', false)
			elsif params[:inquirystatus] == "unapproved"
				@enrollments = Enrollment.where('approved = ?', false)
			end
			@enrollments.each{|enrollment|enrollment.retrieve_virtual_attributes}
			respond_to do |format|
		      format.json { render json: @enrollments.to_json }
		    end
		end
	end
	def update
		get_current_user
		return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

		@enrollment = Enrollment.find(params[:id])
	    respond_to do |format|
	      	if @enrollment.update_attributes(params[:enrollment])
	      		@enrollment.retrieve_virtual_attributes
	        	format.json { render json: @enrollment.to_json }
	      	else
	        	format.json { render json: @enrollment.errors, status: :unprocessable_entity }
	      	end
	    end
	end
	def destroy
		get_current_user
		return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin
		
		@enrollment = Enrollment.find(params[:id])
		@enrollment.destroy
		return render json: {}
	end
end
