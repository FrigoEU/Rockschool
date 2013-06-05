class AddActiveToPeriods < ActiveRecord::Migration
  def change
    add_column :periods, :active, :boolean
  end
end
