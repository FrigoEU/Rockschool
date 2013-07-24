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
      @students = teacher.lessongroups.students
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

    if params.has_key?(:email) #&& params[:create_user] == true
      @user = User.new({
        email: params[:email],
        password: "rockschool",
        password_confirmation: "rockschool", 
        role: "student"
      })
      if params[:mail_student] == true
        #sendgrid mail app
        UserMailer.welcome_email(@user).deliver
      end
    end
    respond_to do |format|
      if @user.save
        @student = Student.new({
          firstname: params[:firstname],
          lastname: params[:lastname], 
          phone: params[:phone], 
          address1: params[:address1], 
          address2: params[:address2],
          user_id: @user.id
        })
        if @student.save
          @student.retrieve_virtual_attributes
          @student.new_user = true
          format.json { render json: @student, status: :created, location: @student }
          @user.role_id = @student.id
          @user.save
        else
          @user.destroy
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
    @student = Student.find(params[:id])
    @madeNewUser = false

    if params.has_key?(:email) && params[:email] != @student.user.email
 
      @newUser = User.new({
        email: params[:email],
        password: "rockschool",
        password_confirmation: "rockschool",
        role: "student", 
        role_id: @student.id
        })

      if @newUser.save
        get_current_user
        if @current_user.isStudent
          cookies.delete(:remember_token)
          cookies.permanent[:remember_token] = @newUser.remember_token
          @student.new_user = true
        end
        @student.user.destroy
        params[:student][:user_id] = @newUser.id
        @madeNewUser = true
      else
        respond_to do |format|
          format.json { render json: {errors: @newUser.errors.full_messages}, status: :unprocessable_entity }
        end
      end
    end

    if @student.update_attributes(params[:student])
      @student.retrieve_virtual_attributes
      if @madeNewUser 
        @student.new_user = true
      end
      respond_to do |format|
        format.json {  render json: @student }
      end
    else
      format.json { render json: {errors: @student.errors.full_messages}, status: :unprocessable_entity }
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
