class LSAdvisingProxy < BaseProxy

  include ClassLogger

  APP_ID = "CFV"

  def initialize(options = {})
    super(Settings.ls_advising_proxy, options)
  end

  def get
    request("#{Settings.ls_advising_proxy.base_url}")
  end

  def request(path, params = {})
    # logger.debug self.class.fetch_from_cache(@uid)
    # self.class.fetch_from_cache(@uid) do
      student_id = lookup_student_id
      if student_id.nil?
        logger.info "Lookup of student_id for uid #@uid failed, cannot call CFV API path #{path}"
        return nil
      else
        url = "#{path}"
        logger.info "Fake = #@fake; Making request to #{url} on behalf of user #{@uid}, student_id = #{student_id}; cache expiration #{self.class.expires_in}"
        begin
          response = HTTParty.get(url, {:student_id => student_id, :key_api => Settings.ls_advising_proxy.key_api})
          # response = HTTParty.get(url)
          if response.code >= 400
            unless response.code == 404
              logger.error "Connection failed: #{response.code} #{response.body}; url = #{url}"
            end
            return nil
          end

          logger.debug "Remote server status #{response.code}; url = #{url}"
          {
            body: JSON.parse(response.body),
            status_code: response.code
          }
        rescue Errno::ECONNREFUSED, Errno::EHOSTUNREACH => e
          logger.error "Connection to url #{url} failed: #{e.class} #{e.message}"
          {
            body: "Remote server unreachable",
            status_code: 503
          }
        end
        response
      end
    # end
  end
end
