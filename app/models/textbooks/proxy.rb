module Textbooks
  class Proxy < BaseProxy

    include ClassLogger

    APP_ID = 'textbooks'

    def initialize(options = {})
      @section_numbers = options[:section_numbers]
      @course_catalog = options[:course_catalog]
      @dept = options[:dept]
      @slug = options[:slug]
      @term = get_term(@slug)

      super(Settings.textbooks_proxy, options)
    end


    def google_book(isbn)
      google_book_url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn
      google_response = {}
      response = ActiveSupport::Notifications.instrument('proxy', {
        url: google_book_url ,
        class: self.class }) do
          HTTParty.get(
            google_book_url,
            timeout: Settings.application.outgoing_http_timeout
        )
      end

      if response['totalItems'] > 0
        item = response['items'][0]
        google_response = {
          link: item['volumeInfo']['infoLink'],
          image: "https://encrypted.google.com/books/images/frontcover/#{item['id']}?fife=w170-rw"
        }
      end

      return google_response
    end

    def bookstore_info
      info = []
      @section_numbers.each do |section_number|
        info.push({
          dept: @dept,
          course: @course_catalog,
          section: section_number,
          term: @term
        })
      end
      info
    end

    def parse_material(material)
      isbn = material['ean']
      google_info = google_book(isbn)

      amazon_url = 'http://www.amazon.com/gp/search?index=books&linkCode=qs&keywords='
      chegg_url = 'http://www.chegg.com/search/'
      oskicat_url = 'http://oskicat.berkeley.edu/search~S1/?searchtype=i&searcharg='

      {
        author: material['author'],
        image: google_info[:image],
        title: material['title'],
        isbn: isbn,
        # Links
        amazonLink: amazon_url + isbn,
        cheggLink: chegg_url + isbn,
        oskicatLink: oskicat_url + isbn,
        googlebookLink: google_info[:link],
        # Bookstore
        bookstoreInfo: bookstore_info()
      }
    end

    def parse_response(response)
      books = []

      response.each do |item|
        if item['materials']
          item['materials'].each do |material|
            books.push(parse_material(material))
          end
        end
      end

      books
    end

    def get_term(slug)
      slug.sub('-', ' ').upcase
    end

    def get_as_json
      self.class.smart_fetch_from_cache(
        {id: "#{@slug}-#{@dept}-#{@course_catalog}-#{@section_numbers.join('-')}",
         user_message_on_exception: "Currently, we can't reach the bookstore. Check again later for updates, or contact your instructor directly.",
         jsonify: true}) do
        get
      end
    end

    def get
      return {} unless Settings.features.textbooks

      response = request_bookstore_list(@section_numbers)
      books = parse_response(response)
      book_unavailable_error = 'Currently, there is no textbook information for this course. Check again later for updates, or contact your instructor directly.'

      {
        books: {
          items: books,
          bookUnavailableError: book_unavailable_error
        }
      }
    end

    def bookstore_link(section_numbers)
      path = "/course-info"
      params = []

      section_numbers.each do |section_number|
        params.push(
          {
            dept: @dept,
            course: @course_catalog,
            section: section_number,
            term: @term
          }
        )
      end

      # TODO remove
      # params = [
      #   {
      #     dept: 'BIO ENG',
      #     course: '100',
      #     section: '001',
      #     term: 'FALL 2014'
      #   },
      #   {
      #     dept: 'CHEM',
      #     course: '3A',
      #     section: '002',
      #     term: 'FALL 2014'
      #   }
      # ]

      uri = Addressable::URI.encode(params.to_json)
      "#{Settings.textbooks_proxy.base_url}/course-info?courses=#{uri}"
    end

    def request_bookstore_list(section_numbers)
      # We work from saved HTML since VCR does not correctly record bookstore responses.

      # TODO - fix fake
      # return fake_list(ccn) if @fake

      url = bookstore_link(section_numbers)
      logger.info "Fake = #@fake; Making request to #{url}; cache expiration #{self.class.expires_in}"
      response = HTTParty.get(
        url,
        headers: {
          "Authorization" => "Token token=#{Settings.textbooks_proxy.token}"
        },
        timeout: Settings.application.outgoing_http_timeout
      )
      logger.debug "Remote server status #{response.code}; url = #{url}"
      if response.code >= 400
        raise Errors::ProxyError.new("Currently, we can't reach the bookstore. Check again later for updates, or contact your instructor directly.")
      end
      JSON.parse(response.body)
    end

    # TODO - fix fake
    def fake_list(ccn)
      path = Rails.root.join('fixtures', 'html', "textbooks-#{@term}-#{ccn}.html").to_s
      logger.info "Fake = #@fake, getting data from HMTL fixture file #{path}"
      unless File.exists?(path)
        raise Errors::ProxyError.new("Unrecorded textbook response #{path}")
      end
      File.read(path)
    end

  end
end
