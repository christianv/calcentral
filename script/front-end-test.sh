npm -g install jshint
npm -g install jscs
gem install scss-lint
scss-lint app/assets/stylesheets/
[[ $? -ne 0 ]] && exit 1 || echo 'scss-lint was succesful'
