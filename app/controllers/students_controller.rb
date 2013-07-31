class StudentsController < ApplicationController
  include ApplicationHelper
  # GET /students
  # GET /students.json
  def index
    get_current_user
    if @current_user.isAdmin
      @students = Student.all
    elsif @current_user.isTeacher
      teacher = Teacher.where("user_id = ?", @current_user.id)
      @students = teacher.students
    elsif @current_user.isStudent
      @students = Student.where("user_id = ?", @current_user.id)
    end
    @students.each{ |student| student.retrieve_virtual_attributes} unless @students.nil?
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
    get_current_user

    if params[:user_id].blank? && params[:user][:email].blank?
      #Geen informatie over user --> Gewoon student maken
      return make_and_save_new_student(params)
    end

    if (params[:user_id].present?)
      if @current_user.isAdmin
        # Niks, admin moet paswoord niet ingeven
      else
        #student die aan een bestaand emailadres wil koppelen moet zijn paswoord wel ingeven
        user = User.find(params[:user_id])
        if !user.authenticate(params[:password])
          return render json: {errors: ["Het paswoord dat je hebt ingegeven is foutief"]}, status: :unprocessable_entity
        end
      end
      return make_and_save_new_student(params)
    end

    if params[:user][:email].present?
      @user = User.new({
        email: params[:user][:email],
        password: "rockschool",
        password_confirmation: "rockschool",
        role: "student"
        })
      if @user.save
        @student = Student.new(params[:student])
        @student.user_id = @user.id
        if @student.save
          @student.retrieve_virtual_attributes
          return render json: @student, status: :created, location: @student 
        else
          @user.destroy
          return render json: {errors: @student.errors.full_messages}, status: :unprocessable_entity 
        end
      else
        return render json: {errors: @user.errors.full_messages}, status: :unprocessable_entity 
      end
    end
  end

  def make_and_save_new_student(params)
    @student = Student.new(params[:student])
    return save_student(@student)
  end

  def update_and_save_student(params)
    @student = Student.find(params[:id])
    @student.update_attributes(params[:student])
    return save_student(@student)
  end

  def save_student(student)
    if student.save
      student.retrieve_virtual_attributes
      render json: student, status: :created, location: student 
    else
      render json: {errors: student.errors.full_messages}, status: :unprocessable_entity 
    end
  end

  # PUT /students/1
  # PUT /students/1.json
  def update 
    get_current_user
    @student = Student.find(params[:id])
    return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless (@current_user.isAdmin || (@current_user.isStudent && @current_user.id == @student.user_id))

    if params[:user_id].blank? && params[:user][:email].blank?
      logger.debug("case1")
      #Geen informatie over user --> Gewoon student saven
      return update_and_save_student(params)
    end

    if params[:user_id].present?
      logger.debug("case2")
      @new_user = User.find(params[:user_id])
      @old_user = @student.user
      if @new_user == @old_user
        return update_and_save_student(params)
      else #Er wordt ven een uesr naar een andere bestaande user geswitcht
        if @current_user.isAdmin
          # Niks, admin moet paswoord niet ingeven
        else
          #student die aan een bestaand emailadres wil koppelen moet zijn paswoord wel ingeven
          if !@new_user.authenticate(params[:password])
            return render json: {errors: ["Het paswoord dat je hebt ingegeven is foutief"]}, status: :unprocessable_entity
          end
        end
        #Als een student zijn user_id verandert dan moet de token naar de nieuwe token verwijzen

        @student = Student.find(params[:id])
        @student.update_attributes(params[:student])
        if @student.save
          @student.retrieve_virtual_attributes
          new_remember_token(@new_user) if @current_user.isStudent
          check_user_for_existing_roles(@old_user) unless @old_user.nil?
          return render json: @student, status: :created, location: @student 
        else
          return render json: {errors: @student.errors.full_messages}, status: :unprocessable_entity 
        end
      end
    end

    if params[:user][:email].present? && params[:user_id].blank?
      logger.debug("case3")
      @old_user = @student.user
      @new_user = User.new({
        email: params[:user][:email],
        password: "rockschool",
        password_confirmation: "rockschool",
        role: "student"
        })
      if @new_user.save
        @student = Student.find(params[:id])
        @student.user_id = @new_user.id
        if @student.save
          @student.retrieve_virtual_attributes
          new_remember_token(@new_user) if @current_user.isStudent
          check_user_for_existing_roles(@old_user) unless @old_user.nil?
          return render json: @student, status: :created, location: @student 
        else
          @new_user.destroy
          return render json: {errors: @student.errors.full_messages}, status: :unprocessable_entity 
        end
      else
        return render json: {errors: @new_user.errors.full_messages}, status: :unprocessable_entity 
      end
    end

  end

  def check_user_for_existing_roles(user)
    @students = Student.where('user_id = ?', user.id)
    if @students.count == 0 && user.role == "student"
      user.destroy
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
