class UserMailer < ActionMailer::Base
  default from: "simon.van.casteren@gmail.com"
  def welcome_email(user)
  	@user = user
  	@url= "derockschool.herokuapp.com"
  	mail(to: @user.email, subject: "Welkom bij de Rockschool")
  end
end
