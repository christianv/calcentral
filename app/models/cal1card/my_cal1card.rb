# TODO collapse this class into Cal1card::Proxy (maybe)
module Cal1card
  class MyCal1card < UserSpecificModel

    include Cache::LiveUpdatesEnabled

    def get_feed_internal
      feed = {}
      if Settings.features.cal1card
        proxy = Cal1card::Proxy.new({user_id: @uid})
        proxy_response = proxy.get
        if proxy_response.is_a?(Hash)
          feed.merge!(proxy_response)
        end
      end
      feed
    end

  end
end

