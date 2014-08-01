task :travis do

  puts "Running JSHint - detect errors and potential problems in JavaScript code"
  system ("jshint .")
  raise "JSHint failed!" unless $?.exitstatus == 0

  puts "Running jscs - JavaScript Style Checker"
  system ("jscs .")
  raise "jscs failed!" unless $?.exitstatus == 0

  puts "Running scss-lint - Lint our SCSS files"
  system ("gem install scss-lint")
  system ("scss-lint app/assets/stylesheets/")
  raise "scss-lint!" unless $?.exitstatus == 0

end
