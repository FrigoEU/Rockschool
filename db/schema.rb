# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130726210112) do

  create_table "closingperiods", :force => true do |t|
    t.date     "startdate"
    t.date     "enddate"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "enrollments", :force => true do |t|
    t.integer  "student_id"
    t.integer  "lessongroup_id"
    t.boolean  "paid"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
    t.boolean  "approved"
  end

  create_table "lessongroups", :force => true do |t|
    t.integer  "maximum_number_of_students"
    t.datetime "created_at",                 :null => false
    t.datetime "updated_at",                 :null => false
  end

  create_table "lessons", :force => true do |t|
    t.datetime "starttime"
    t.string   "status"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
    t.integer  "teacher_id"
    t.integer  "lessongroup_id"
    t.datetime "endtime"
  end

  create_table "periods", :force => true do |t|
    t.date     "startdate"
    t.boolean  "open_on_monday"
    t.boolean  "open_on_tuesday"
    t.boolean  "open_on_wednesday"
    t.boolean  "open_on_thursday"
    t.boolean  "open_on_friday"
    t.boolean  "open_on_saturday"
    t.boolean  "open_on_sunday"
    t.integer  "openinghours"
    t.integer  "openingminutes"
    t.integer  "closinghours"
    t.integer  "closingminutes"
    t.date     "enddate"
    t.boolean  "open_for_registration"
    t.datetime "created_at",            :null => false
    t.datetime "updated_at",            :null => false
    t.boolean  "active"
  end

  create_table "students", :force => true do |t|
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.string   "phone"
    t.string   "address1"
    t.string   "address2"
    t.string   "firstname"
    t.string   "lastname"
    t.integer  "user_id"
  end

  create_table "teachers", :force => true do |t|
    t.datetime "created_at",              :null => false
    t.datetime "updated_at",              :null => false
    t.integer  "start_hours_monday"
    t.integer  "start_minutes_monday"
    t.integer  "end_hours_monday"
    t.integer  "end_minutes_monday"
    t.integer  "start_hours_tuesday"
    t.integer  "start_minutes_tuesday"
    t.integer  "end_hours_tuesday"
    t.integer  "end_minutes_tuesday"
    t.integer  "start_hours_wednesday"
    t.integer  "start_minutes_wednesday"
    t.integer  "end_hours_wednesday"
    t.integer  "end_minutes_wednesday"
    t.integer  "start_hours_thursday"
    t.integer  "start_minutes_thursday"
    t.integer  "end_hours_thursday"
    t.integer  "end_minutes_thursday"
    t.integer  "start_hours_friday"
    t.integer  "start_minutes_friday"
    t.integer  "end_hours_friday"
    t.integer  "end_minutes_friday"
    t.integer  "start_hours_saturday"
    t.integer  "start_minutes_saturday"
    t.integer  "end_hours_saturday"
    t.integer  "end_minutes_saturday"
    t.integer  "start_hours_sunday"
    t.integer  "start_minutes_sunday"
    t.integer  "end_hours_sunday"
    t.integer  "end_minutes_sunday"
    t.string   "bio"
    t.string   "courses"
    t.string   "firstname"
    t.string   "lastname"
  end

  create_table "users", :force => true do |t|
    t.string   "email"
    t.string   "password_digest"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
    t.string   "role"
    t.integer  "role_id"
    t.string   "remember_token"
  end

  add_index "users", ["remember_token"], :name => "index_users_on_remember_token"

end
