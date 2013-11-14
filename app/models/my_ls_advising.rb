class MyLsAdvising < MyMergedModel

  def get_feed_internal
    feed = {}
    proxy = LSAdvisingProxy.new({user_id: @uid})
    proxy_response = proxy.get

    puts "qwerqwerqwer"
    puts proxy_response

    #logger.debug proxy_response
    # if proxy_response && body = proxy_response[:body]
    #if proxy_response && body = proxy_response.body
      #logger.debug body
      # feed.merge!(body)
    #end
    # feed
    #JSON.parse(proxy_response.body)
  end

end
