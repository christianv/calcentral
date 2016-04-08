# encoding: utf-8
describe CalnetLdap::UserAttributes do

  let(:feed) { described_class.new(user_id: uid).get_feed_internal }

  context 'mock LDAP connection' do
    let(:uid) { '61889' }
    let(:ldap_result) do
      {
        dn: ['uid=61889,ou=people,dc=berkeley,dc=edu'],
        objectclass: ['top', 'eduPerson', 'inetorgperson', 'berkeleyEduPerson', 'organizationalperson', 'person', 'ucEduPerson'],
        o: ['University of California, Berkeley'],
        ou: ['people'],
        mail: ['oski@berkeley.edu'],
        berkeleyeduofficialemail: ['oski_bearable@berkeley.edu'],
        berkeleyeduaffiliations: ['AFFILIATE-TYPE-ADVCON-STUDENT', 'AFFILIATE-TYPE-ADVCON-ATTENDEE', 'STUDENT-TYPE-NOT REGISTERED'],
        givenname: ['Oski'],
        berkeleyeduconfidentialflag: ['false'],
        berkeleyeduemailrelflag: ['false'],
        uid: ['61889'],
        berkeleyedumoddate: ['20160211155206Z'],
        berkeleyedustuid: ['11667051'],
        displayname: ['Oski BEAR'],
        sn: ['BEAR'],
        cn: ['BEAR, Oski']
      }
    end
    before { allow(CalnetLdap::Client).to receive(:new).and_return double(search_by_uid: ldap_result) }
    it 'translates LDAP attributes' do
      expect(feed[:email_address]).to eq 'oski@berkeley.edu'
      expect(feed[:official_bmail_address]).to eq 'oski_bearable@berkeley.edu'
      expect(feed[:first_name]).to eq 'Oski'
      expect(feed[:last_name]).to eq 'BEAR'
      expect(feed[:ldap_uid]).to eq '61889'
      expect(feed[:person_name]).to eq 'Oski BEAR'
      expect(feed[:roles][:student]).to eq true
      expect(feed[:roles][:registered]).to eq false
      expect(feed[:roles][:exStudent]).to eq false
      expect(feed[:student_id]).to eq '11667051'
    end

    context 'customized Directory names' do
      let(:ldap_result) do
        {
          givenname: ['Hermann', 'H Ford'],
          uid: ['61889'],
          displayname: ['Daniel Chaucer'],
          sn: ['Hueffer'],
          berkeleyEduFirstName: ['Ford Madox'],
          berkeleyEduLastName: ['Ford']
        }
      end
      it 'prioritizes the customized names' do
        expect(feed[:first_name]).to eq 'Ford Madox'
        expect(feed[:last_name]).to eq 'Ford'
        expect(feed[:ldap_uid]).to eq '61889'
        expect(feed[:person_name]).to eq 'Daniel Chaucer'
      end
    end

    context 'UTF-8 characters with generic encoding specified' do
      let(:ldap_result) do
        {
          givenname: ["Fernando Ant\xC3\xB3nio".force_encoding('ASCII-8BIT')],
          uid: ['61889'],
          displayname: ["\xC3\x81lvaro de Campos".force_encoding('ASCII-8BIT')],
          sn: ["Pess\xC3\xB4a".force_encoding('ASCII-8BIT')],
          berkeleyEduFirstName: ["Bar\xC3\xA3o".force_encoding('ASCII-8BIT')],
          berkeleyEduLastName: ['de Teive']
        }
      end

      it 'recognizes encoding and does not blow up on JSON conversion' do
        expect(feed[:first_name].to_json).to eq '"Barão"'
        expect(feed[:person_name].to_json).to eq '"Álvaro de Campos"'
      end
    end

    context 'no affiliation data in LDAP' do
      let(:ldap_result) do
        {
          mail: ['oski@berkeley.edu'],
          uid: ['61889'],
        }
      end
      it 'returns empty roles hash' do
        expect(feed[:roles].select {|role, val| val}).to be_blank
      end
    end

    context 'when both active and expired student affiliations appear' do
      let(:ldap_result) do
        {
          berkeleyeduaffiliations: ['EMPLOYEE-TYPE-STAFF', 'STUDENT-STATUS-EXPIRED', 'STUDENT-TYPE-REGISTERED'],
          berkeleyedustuexpdate: ['20140901145959Z'],
          uid: ['61889']
        }
      end
      it 'chooses one' do
        expect(feed[:roles][:student]).to eq true
        expect(feed[:roles][:registered]).to eq true
        expect(feed[:roles][:exStudent]).to be_falsey
        expect(feed[:roles][:staff]).to eq true
      end
    end
  end

  context 'test user from real LDAP connection', testext: true do
    let(:uid) { '212373' }
    it 'translates attributes' do
      expect(feed[:ldap_uid]).to eq '212373'
      expect(feed[:first_name]).to eq 'AFF-GUEST'
      expect(feed[:last_name]).to eq 'TEST'
      expect(feed[:person_name]).to eq 'AFF-GUEST TEST'
    end
  end

  context 'two test users from real LDAP connection', testext: true do
    let(:feed) { described_class.get_bulk_attributes %w(212373 11000023) }
    it 'translates attributes' do
      expect(feed).to have(2).items
      expect(feed.find { |result| result[:ldap_uid] == '212373' }).to be_present
      expect(feed.find { |result| result[:ldap_uid] == '11000023' }).to be_present
    end
  end
end
