require "spec_helper"

describe Canvas::SiteCreation do
  let(:uid) { rand(999999).to_s }

  describe '#authorizations' do

    subject { Canvas::SiteCreation.new(:uid => uid).authorizations }

    context 'when user is not a staff or faculty member' do
      before { allow_any_instance_of(CampusOracle::UserAttributes).to receive(:is_staff_or_faculty?).and_return(false) }

      it 'returns false for all authorizations' do
        expect(subject).to be_an_instance_of Hash
        expect(subject[:authorizations]).to be_an_instance_of Hash
        expect(subject[:authorizations][:canCreateCourseSite]).to eq false
        expect(subject[:authorizations][:canCreateProjectSite]).to eq false
      end
    end

    context 'when user is a staff or faculty member' do
      before { allow_any_instance_of(CampusOracle::UserAttributes).to receive(:is_staff_or_faculty?).and_return(true) }

      it 'indicates the user can create a project site' do
        expect(subject).to be_an_instance_of Hash
        expect(subject[:authorizations]).to be_an_instance_of Hash
        expect(subject[:authorizations][:canCreateCourseSite]).to eq false
        expect(subject[:authorizations][:canCreateProjectSite]).to eq true
      end

      context 'when user has official sections in current or upcoming term' do
        before { allow_any_instance_of(Canvas::CurrentTeacher).to receive(:user_currently_teaching?).and_return(true) }
        it 'indicates the user can create a course site' do
          expect(subject).to be_an_instance_of Hash
          expect(subject[:authorizations]).to be_an_instance_of Hash
          expect(subject[:authorizations][:canCreateCourseSite]).to eq true
          expect(subject[:authorizations][:canCreateProjectSite]).to eq true
        end
      end
    end

  end

end