class SentimentsController < ApplicationController
  def index
    input = params[:input]
    url = "https://gateway.watsonplatform.net/tone-analyzer/api"
    debugger
    response = Excon.get(url + "/v3/tone",
    :headers  => {
      "Content-Type"            => "text/plain",
      "Content-Language"        => "en",
      "Accept-Language"         => "en"
    },
    :query => {
      :text => input,
      :version => '2016-05-19',
      :tones => 'emotion, language, social'
    },
    :user                       => ENV['watson_username'],
    :password                   => ENV['watson_password'],
    )

    render json: response.body
  end
end
