class LessonsController < ApplicationController
  # GET /lessons
  # GET /lessons.json
  def index
    if params.has_key?(:startDate) && params.has_key?(:endDate) && params.has_key?(:teacher_id)
      @startDateParsed = Time.at(params[:startDate].to_f)
      @endDateParsed = Time.at(params[:endDate].to_f)   
      @lessons = Lesson.where("teacher_id = ? AND starttime > ? AND starttime < ?", params[:teacher_id], @startDateParsed, @endDateParsed)
    else # Gewoon RESTful alles ophalen
      @lessons = Lesson.all
    end
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @lessons }
    end
  end

  # POST /lessons
  # POST /lessons.json
  def create
    @starttime = Time.parse(params[:startTime])
    @endtime = Time.parse(params[:endTime])
    @lessongroup_id = params[:lessongroup_id].to_i
    @teacher_id = params[:teacher].to_i
    @lesson = Lesson.new({
      starttime: @starttime,
      endtime: @endtime,
      lessongroup_id: @lessongroup_id,
      teacher_id: @teacher_id,
      status: params[:status]
      })

    respond_to do |format|
      if @lesson.save
        format.html { redirect_to @lesson, notice: 'Lesson was successfully created.' }
        format.json { render json: @lesson, status: :created, location: @lesson }
      else
        format.html { render action: "new" }
        format.json { render json: @lesson.errors, status: :unprocessable_entity }
      end
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
    logger.debug(@starttime)
    logger.debug(@endtime)

    respond_to do |format|
      if @lesson.update_attributes({
      starttime: @starttime,
      endtime: @endtime,
      lessongroup_id: @lessongroup_id,
      teacher_id: @teacher_id,
      status: params[:status]
      })
        format.html { redirect_to @lesson, notice: 'Lesson was successfully updated.' }
        format.json { render json: @lesson }
      else
        format.html { render action: "edit" }
        format.json { render json: {:errors => @lesson.errors.full_messages}, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /lessons/1
  # DELETE /lessons/1.json
  def destroy
    @lesson = Lesson.find(params[:id])
    @lesson.destroy

    respond_to do |format|
      format.html { redirect_to lessons_url }
      format.json { head :no_content }
    end
  end
end
