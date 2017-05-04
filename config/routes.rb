Rails.application.routes.draw do
  root to: 'static_page#root'
  get 'tweets/index'
  get 'sentiments/index'
end
