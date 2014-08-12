module Textbooks
  class Proxy < BaseProxy

    include ClassLogger

    APP_ID = 'textbooks'

    def initialize(options = {})
      puts options
      @section_numbers = options[:section_numbers]
      @course_catalog = options[:course_catalog]
      @dept = options[:dept]
      @slug = options[:slug]
      @term = get_term(@slug)
      # The first section number is used as a cache key.
      @section_number = @section_numbers[0]

      super(Settings.textbooks_proxy, options)
    end


    def google_book(isbn)
      google_book_url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn
      google_response = ''
      response = ActiveSupport::Notifications.instrument('proxy', { url: google_book_url , class: self.class }) do
          HTTParty.get(
        google_book_url,
        timeout: Settings.application.outgoing_http_timeout
      )
      end

      if response['totalItems'] > 0
        google_response = response['items'][0]['volumeInfo']['infoLink']
      end

      return google_response
    end

    def ul_to_dict(ul, bookstore_link)
      books = []
      amazon_url = 'http://www.amazon.com/gp/search?index=books&linkCode=qs&keywords='
      chegg_url = 'http://www.chegg.com/search/'
      oskicat_url = 'http://oskicat.berkeley.edu/search~S1/?searchtype=i&searcharg='

      if ul.length > 0
        book_list = ul.xpath('./li')
        book_list.each do |bl|
          book_detail = {
            hasChoices: bl.xpath('.//h3[@class="material-group-title choice-title"]').length > 0 || bl.xpath('.//div[@class="choice-list-heading-sub"]').length > 0,
            title: bl.xpath('.//h3[@class="material-group-title"]')[0].text.split("\n")[0].strip,
            image: bl.xpath('.//span[@id="materialTitleImage"]/img/@src')[0].text.gsub('http:', '').strip,
            author: bl.xpath('.//span[@id="materialAuthor"]')[0].text.split(':')[1].strip,
            edition: bl.xpath('.//span[@id="materialEdition"]')[0].text.split(':')[1].strip,
            publisher: bl.xpath('.//span[@id="materialPublisher"]')[0].text.split(':')[1].strip,
            bookstoreLink: bookstore_link
          }
          if (isbn_node = bl.xpath('.//span[@id="materialISBN"]')[0])
            isbn = isbn_node.text.split(':')[1].strip
            book_detail.merge!({
              isbn: isbn,
              amazonLink: amazon_url + isbn,
              cheggLink: chegg_url + isbn,
              oskicatLink: oskicat_url + isbn,
              googlebookLink: google_book(isbn)
            })
          end
          books.push(book_detail)
        end
      end
      books
    end

    def parse_response(response)
      books = []


    end

    def has_choices(category_books)
      category_books.any? { |i| i[:hasChoices] == true }
    end

    def get_term(slug)
      slug.sub('-', ' ').upcase
    end

    def get_as_json
      self.class.smart_fetch_from_cache(
        {id: "#{@ccn}-#{@slug}",
         user_message_on_exception: "Currently, we can't reach the bookstore. Check again later for updates, or contact your instructor directly.",
         jsonify: true}) do
        get
      end
    end

    def get
      return {} unless Settings.features.textbooks

      response = request_bookstore_list(@section_numbers)

      puts "reofreof"
      puts response
      books = parse_response(response)

      book_unavailable_error 'Currently, there is no textbook information for this course. Check again later for updates, or contact your instructor directly.'

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
            :dept => @dept,
            :course => @course_catalog,
            :section => section_number,
            :term => @term
          }
        )
      end

      # TODO remove
      params = [
        {
          :dept => 'BIO ENG',
          :course => '100',
          :section => '001',
          :term => 'FALL 2014'
        },
        {
          :dept => 'CHEM',
          :course => '3A',
          :section => '002',
          :term => 'FALL 2014'
        }
      ]

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
      response.body
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
