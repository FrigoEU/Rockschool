class HomeController < ApplicationController
	include ApplicationHelper

  # GET /lessons
  # GET /lessons.json
  def index
  	get_current_user
  end
end
