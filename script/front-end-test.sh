node_version=`node --version`
echo "Node version: $node_version"
npm config set strict-ssl false
npm install
export CALCENTRAL_WATCH="false"
npm run build
gem install scss-lint --version 0.31.0
scss-lint src/assets/stylesheets/
[[ $? -ne 0 ]] && echo 'scss-lint failed' && exit 1 || echo 'scss-lint was succesful'
