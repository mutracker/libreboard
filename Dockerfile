FROM grigio/meteor:1.0.3.1

# Add the source of your Meteor app and build
ADD . /app
RUN /meteor-build.sh

# Run the generated files
CMD /meteor-run.sh

##  Build the image
# sudo docker build -t grigio/metrello .

## Run it as you wish :)
# sudo docker run -d -e "VIRTUAL_HOST=metrello.home" -e "MONGO_URL=mongodb://172.17.0.3:27017/metrello-test" \
#  -e "ROOT_URL=http://example.com" -p 5555:8080 -it grigio/metrello sh /meteor-run.sh
