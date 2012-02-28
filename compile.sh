mkdir -p ../astroexplorer-js
coffee -o ../astroexplorer-js -c *.coffee
pushd ../astroexplorer-js
[ -L static ] || ln -s ../astroexplorer-client/static .
popd
