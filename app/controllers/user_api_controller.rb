class UserApiController < ApplicationController

  def mystatus
    logger.debug "mystatus for uid '#{session[:user_id]}'"
    if session[:user_id]
      user_data = UserApi.get_user_data session[:user_id]
      render :json => {
          :is_logged_in => true
      }.merge!(user_data).to_json
    else
      render :json => {
          :is_logged_in => false
      }.to_json
    end
  end

end
