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

ActiveRecord::Schema.define(:version => 20130604110950) do

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
  end

  create_table "lessongroups", :force => true do |t|
    t.integer  "maximum_number_of_students"
    t.datetime "created_at",                 :null => false
    t.datetime "updated_at",                 :null => false
  end

  create_table "lessons", :force => true do |t|
    t.integer  "duration"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.integer  "teacher_id"
    t.datetime "starttime"
    t.string   "status"
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
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "teachers", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

end
