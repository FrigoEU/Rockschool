class CreateClosingperiods < ActiveRecord::Migration
  def change
    create_table :closingperiods do |t|
      t.date :startdate
      t.date :enddate

      t.timestamps
    end
  end
end
