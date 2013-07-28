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

    if params.has_key?(:email) && params[:email] != "" 
      @user = make_new_user(params[:email], "teacher")
      @madeNewUser = true
      @no_user = false
    else 
      @no_user = true
    end
    if @no_user || @user.save 
      if @no_user 
        user_id = 0 
      else
        user_id = @user.id
      end
      @teacher = Teacher.new(params[:teacher])
      @teacher.user_id = user_id
      if @madeNewUser 
        @teacher.new_user = true
      end
      if @teacher.save
        @teacher.retrieve_virtual_attributes
        render json: @teacher, status: :created, location: @teacher
        @user.role_id = @teacher.id unless @no_user
        @user.save unless @no_user
      else
        @user.destroy unless @no_user
        render json: {errors: @teacher.errors.full_messages}, status: :unprocessable_entity 
      end
    else
     render json: {errors: @user.errors.full_messages}, status: :unprocessable_entity
    end
  end

  # PUT /teachers/1
  # PUT /teachers/1.json
  def update
    get_current_user
    return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless (@current_user.isAdmin || (@current_user.isTeacher && @current_user.role_id == params[:id]))

    @teacher = Teacher.find(params[:id])
    @madeNewUser = false

    if params.has_key?(:email) && params[:email] != "" && (@teacher.user.nil? || params[:email] != @teacher.user.email )
      @newUser = make_new_user(params[:email], "teacher", @teacher.id)

      if @newUser.save
        if @current_user.isTeacher
          cookies.delete(:remember_token)
          cookies.permanent[:remember_token] = @newUser.remember_token
        end
        @teacher.user.destroy unless @teacher.user.nil?
        params[:teacher][:user_id] = @newUser.id
        @madeNewUser = true
      else
        return render json: {errors: @newUser.errors.full_messages}, status: :unprocessable_entity 
      end
    end

    if @teacher.update_attributes(params[:teacher])
      @teacher.retrieve_virtual_attributes
      if @madeNewUser 
        @teacher.new_user = true
      end
      render json: @teacher 
      
    else
      render json: {errors: @teacher.errors.full_messages}, status: :unprocessable_entity 
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
