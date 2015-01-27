node_version=`node --version`
echo "Node version: $node_version"
cal_whoami=`whoami`
echo "whoami: $cal_whoami"
cal_which_node=`which node`
echo "which node: $cal_which_node"
echo "path: $PATH"
npm install
export CALCENTRAL_WATCH="false"
gulp build
gem install scss-lint --version 0.31.0
scss-lint src/assets/stylesheets/
[[ $? -ne 0 ]] && echo 'scss-lint failed' && exit 1 || echo 'scss-lint was succesful'
