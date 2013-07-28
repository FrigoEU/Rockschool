class StudentsController < ApplicationController
  include ApplicationHelper
  # GET /students
  # GET /students.json
  def index
    get_current_user
    if @current_user.isAdmin
      @students = Student.all
      @students.each{ |student| student.retrieve_virtual_attributes}
    elsif @current_user.isTeacher
      teacher = Teacher.find(@current_user.role_id)
      @students = teacher.students
      @students.each{ |student| student.retrieve_virtual_attributes}
    elsif @current_user.isStudent
      @students = Student.find(@current_user.role_id)
      @students.retrieve_virtual_attributes
    end

    respond_to do |format|
      format.json { render json: @students }
    end
  end

  # GET /students/1
  # GET /students/1.json
  def show
    @student = Student.find(params[:id])

    respond_to do |format|
      format.json { render json: @student }
    end
  end

  # POST /students
  # POST /students.json
  def create

    if params.has_key?(:email) && params[:email] != "" #&& params[:create_user] == true
      @user = make_new_user(params[:email], "student")
      @madeNewUser = true
      @no_user = false
    else 
      @no_user = true
    end
    respond_to do |format|
      if @no_user || @user.save 
        if @no_user 
          user_id = 0 
        else
          user_id = @user.id
        end

        @student = Student.new(params[:student])
        @student.user_id = user_id
        if @madeNewUser 
          @student.new_user = true
        end
        if @student.save
          @student.retrieve_virtual_attributes
          format.json { render json: @student, status: :created, location: @student }
          @user.role_id = @student.id unless @no_user
          @user.save unless @no_user
        else
          @user.destroy unless @no_user
          format.json { render json: {errors: @student.errors.full_messages}, status: :unprocessable_entity }
        end
      else
        format.json { render json: {errors: @user.errors.full_messages}, status: :unprocessable_entity }
      end
    end
  end

  # PUT /students/1
  # PUT /students/1.json
  def update 
    get_current_user
    return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless (@current_user.isAdmin || (@current_user.isStudent && @current_user.role_id == params[:id].to_i))

    @student = Student.find(params[:id])
    @madeNewUser = false

    if params.has_key?(:email) && params[:email] != "" && (@student.user.nil? || params[:email] != @student.user.email )
      @new_user = make_new_user(params[:email], "student", @student.id)

      if @new_user.save
        if @current_user.isStudent
          cookies.delete(:remember_token)
          cookies.permanent[:remember_token] = @new_user.remember_token
        end
        @student.user.destroy unless @student.user.nil?
        params[:student][:user_id] = @new_user.id
        @madeNewUser = true
      else
        return render json: {errors: @new_user.errors.full_messages}, status: :unprocessable_entity 
      end
    end

    if @student.update_attributes(params[:student])
      @student.retrieve_virtual_attributes
      if @madeNewUser 
        @student.new_user = true
      end
      render json: @student 
      
    else
      render json: {errors: @student.errors.full_messages}, status: :unprocessable_entity 
    end
  end

  # DELETE /students/1
  # DELETE /students/1.json
  def destroy
    @student = Student.find(params[:id])
    @student.destroy

    respond_to do |format|
      format.html { redirect_to students_url }
      format.json { head :no_content }
    end
  end
end
