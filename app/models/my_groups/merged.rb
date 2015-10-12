module MyGroups
  class Merged < UserSpecificModel
    include Cache::LiveUpdatesEnabled
    include Cache::FreshenOnWarm
    include Cache::JsonAddedCacher

    def get_feed_internal
      groups = []
      [
        MyGroups::Callink,
        MyGroups::Canvas
      ].each do |provider|
        groups.concat(provider.new(@uid).fetch)
      end
      groups.sort! { |x, y| x[:name].casecmp(y[:name]) }
      {
        groups: groups
      }
    end

  end
end
