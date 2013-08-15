require "spec_helper"

describe "MyAcademics::Semesters" do

  it "should get properly formatted data from fake Oracle dataset" do
    feed = {}
    MyAcademics::PastSemesters.new("61889").merge(feed)

    feed.empty?.should be_false
    feed[:past_semesters].size.should_not == 0

    if CampusData.test_data?
      feed[:past_semesters].size.should == 24
      feed[:past_semesters][0][:name].should == "Fall 2012"
      feed[:past_semesters][0][:courses].size.should == 3
    end

  end
end
