class EnrollmentsController < ApplicationController
	def create
		unless argumentok?(params, :lessongroup) || (argumentok?(params, :teacher) && argumentok?(params, :type) && argumentok?(params, :startTime) && argumentok?(params, :duration))
			raise ArgumentException, "Enrollments need either an existing lessongroup or a teacher, type, starttime and duration"
		end

		unless argumentok?(params, :student)
			raise ArgumentException, "Enrollments need a student"
		end

		#startTimeParsed = Time.at(params[:startTime].to_f)
		@lessongroup = Lessongroup.find(params[:lessongroup][:id].to_i) if argumentok?(params, :lessongroup)
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
		if @lessongroup.errors.empty?
			if @lessongroup.save
				@enrollment = Enrollment.new({
					lessongroup_id: @lessongroup.id,
					student_id: @student.id,
					paid: false
				})
				respond_to do |format|
					if @enrollment.save
						format.json { render json: {:enrollment => @enrollment, :lessongroup => @lessongroup, :lessons => @lessongroup.lessons}, status: :created }
					else
						format.json { render json: @enrollment.errors, status: :unprocessable_entity }	
					end
				end
			else
				respond_to do |format|
					format.json{ render json:{:errors => @lessongroup.errors.full_messages}, status: :unprocessable_entity }
				end
			end
		else
			respond_to do |format|
				format.json{ render json:{:errors => @lessongroup.errors.full_messages}, status: :unprocessable_entity }
			end
		end
	end
end
