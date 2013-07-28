class TeachersController < ApplicationController
  include ApplicationHelper
  # GET /teachers
  # GET /teachers.json
  def index
    @teachers = Teacher.find(:all)

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @teachers }
    end
  end

  # POST /teachers
  # POST /teachers.json
  def create
    get_current_user
    return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

    @teacher = Teacher.new(params[:teacher])

    respond_to do |format|
      if @teacher.save
        format.json { render json: @teacher, status: :created, location: @teacher }
      else
        format.json { render json: {errors: @teacher.errors.full_messages}, status: :unprocessable_entity }
      end
    end
  end

  # PUT /teachers/1
  # PUT /teachers/1.json
  def update
    get_current_user
    return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

    @teacher = Teacher.find(params[:id])

    respond_to do |format|
      if @teacher.update_attributes(params[:teacher])
        format.json { head :no_content }
      else
        format.json { render json: {errors: @teacher.errors.full_messages}, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /teachers/1
  # DELETE /teachers/1.json
  def destroy
    get_current_user
    return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

    @teacher = Teacher.find(params[:id])
    @teacher.destroy

    respond_to do |format|
      format.html { redirect_to teachers_url }
      format.json { head :no_content }
    end
  end
end
