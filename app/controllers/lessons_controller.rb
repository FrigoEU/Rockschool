class LessonsController < ApplicationController
  include ApplicationHelper
  # GET /lessons
  # GET /lessons.json
  def index
    if params.has_key?(:startDate) && params.has_key?(:endDate) && params.has_key?(:teacher_id)
      @startDateParsed = Time.at(params[:startDate].to_f)
      @endDateParsed = Time.at(params[:endDate].to_f)   
      @lessons = Lesson.where("teacher_id = ? AND starttime > ? AND starttime < ?", params[:teacher_id], @startDateParsed, @endDateParsed)
    elsif params.has_key?(:inquirystatus) # Gewoon RESTful alles ophalen
      @lessons = Lesson.where("status = ?", params[:inquirystatus])
    else
      @lessons = Lesson.all
    end
    get_current_user
    @lessons.each  do 
      |lesson|
      authorized = lesson.authorized?(@current_user)
      lesson.retrieve_virtual_attributes(authorized)
      lesson.adapt_status_to_authorization(authorized)
    end
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @lessons.to_json }
    end
  end


  # PUT /lessons/1
  # PUT /lessons/1.json
  def update
    @lesson = Lesson.find(params[:id])
    @starttime = Time.parse(params[:startTime])
    @endtime = Time.parse(params[:endTime])
    @lessongroup_id = params[:lessongroup_id].to_i
    @teacher_id = params[:teacher].to_i
    @status = params[:status]
    @lessongroup = @lesson.lessongroup
    
    if params[:data][:action] == 'absentreq' || params[:data][:action] == 'absentok'
      absentcount = 0
      @lessongroup.lessons.each do
        |lesson|
        if (lesson.status == 'absentreq' || lesson.status == 'absentok') && lesson.id != @lesson.id
          absentcount = absentcount + 1
        end
      end
      if absentcount >= 2 
        return render json: {errors: ["Je mag slechts 2 lessen wettelijk afwezig zijn per schooljaar"]}, status: :unprocessable_entity 
      end
    end

    case params[:data][:action]
    when 'acceptenrollment'
      @lessongroup.enrollments.each do
        |enrollment|
        enrollment.approved=true
        enrollment.save
      end
      @status="open"
    when 'removeenrollment'
      @lessongroup.lessons.destroy_all
      @lessongroup.enrollments.destroy_all
      @lessongroup.destroy
      return render json: {}
    when 'payenrollment'
      @lessongroup.enrollments.each do
        |enrollment|
        enrollment.paid = true
        enrollment.save
      end
    when 'open'
      @status = :open
    when 'absentreq'
      @status = :absentreq
    when 'absentok'
      @status = :absentok
    when 'absentnok'
      @status = :absentnok
    when 'done'
      @status = :done
    else
      raise ArgumentError, 'Incorrect action parameter in lesson update'
    end

    respond_to do |format|
      if @lesson.update_attributes({
      status: @status
      })
        get_current_user
        authorized = @lesson.authorized?(@current_user)
        @lesson.retrieve_virtual_attributes(authorized)
        @lesson.adapt_status_to_authorization(authorized)
        format.json { render json: @lesson.to_json }
      else
        format.json { render json: {:errors => @lesson.errors.full_messages}, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /lessons/1
  # DELETE /lessons/1.json
  def destroy
    get_current_user
    return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

    @lesson = Lesson.find(params[:id])
    @lesson.destroy

    respond_to do |format|
      format.html { redirect_to lessons_url }
      format.json { head :no_content }
    end
  end
  def create
    get_current_user
    return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin
    
    if params.has_key?(:lessongroup_id)
      @lessongroup = Lessongroup.find(params[:lessongroup_id])
      @lessongroup.make_lesson_at_the_end
      if @lessongroup.save
        render json: @lessongroup.lessons.last.to_json
      else
        render json: {:errors => @lessongroup.errors.full_messages}, status: :unprocessable_entity 
      end
    end
  end
end
