FROM backitinc/lambda-ffmpeg

COPY . ./

RUN npm install
RUN npm run build
# If you are building your code for production, instead include a package-lock.json file on this directory and use:
# RUN npm ci --production

# Command can be overwritten by providing a different command in the template directly.
CMD ["./dist/app.lambdaHandler"]
