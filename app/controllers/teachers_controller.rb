class TeachersController < ApplicationController
  # GET /teachers
  # GET /teachers.json
  def index
    @teachers = Teacher.find(:all)

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @teachers }
    end
  end

  # GET /teachers/1/edit
  def edit
    @teacher = Teacher.find(params[:id])
  end

  # POST /teachers
  # POST /teachers.json
  def create
    @teacher = Teacher.new({
      name: params[:name],
      starttimehours: params[:startTimeHours].to_i,
      endtimehours: params[:endTimeHours].to_i,
      starttimeminutes: params[:startTimeMinutes].to_i,
      endtimeminutes: params[:endTimeMinutes].to_i,
      teachingonfriday: params[:teachingOnFriday],
      teachingonmonday: params[:teachingOnMonday],
      teachingonsaturday: params[:teachingOnSaturday],
      teachingonsunday: params[:teachingOnSunday],
      teachingonthursday: params[:teachingOnThursday],
      teachingontuesday: params[:teachingOnTuesday],
      teachingonwednesday: params[:teachingOnWednesday]
      })

    respond_to do |format|
      if @teacher.save
        format.html { redirect_to @teacher, notice: 'Teacher was successfully created.' }
        format.json { render json: @teacher, status: :created, location: @teacher }
      else
        format.html { render action: "new" }
        format.json { render json: @teacher.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /teachers/1
  # PUT /teachers/1.json
  def update
    @teacher = Teacher.find(params[:id])

    respond_to do |format|
      if @teacher.update_attributes(params[:teacher])
        format.html { redirect_to @teacher, notice: 'Teacher was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @teacher.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /teachers/1
  # DELETE /teachers/1.json
  def destroy
    @teacher = Teacher.find(params[:id])
    @teacher.destroy

    respond_to do |format|
      format.html { redirect_to teachers_url }
      format.json { head :no_content }
    end
  end
end
