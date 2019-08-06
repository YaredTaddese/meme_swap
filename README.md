# Personalized Meme Service Web App

## How to start the app

In the project directory, you can run:

### Start the react app

Using the command: `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### Setup envoy proxy to use grpc-web

In order to call grpc client from browser, you have to setup a proxy server that can map your browser request to grpc call and vice versa. Currently, envoy proxy is the best option to achieve this; and using docker, setup the required envoy proxy using the commands below: 

- `docker build -t grpc_envoy -f ./envoy.Dockerfile .`
- `docker run --net=host -p 8080:8080 -p 9901:9901  grpc_envoy`

### Make sure grpc server is running

You have to make sure the corresponding grpc server is running. You can find this grpc server from: 
[https://github.com/yonycherkos/faceSwap](https://github.com/yonycherkos/faceSwap)

### How to generate necessary client side grpc code from image_swap.proto file (Optional)

You must install the necessary packages to use `protoc` command for grpc-web.

Use the below command inside src folder of the project: 
`protoc -I=. image_swap.proto --js_out=import_style=commonjs:. --grpc-web_out=import_style=commonjs,mode=grpcwebtext:.`

This command will generate two javascript files;`image_swap_grpc_web.js` and `image_swap_bp.js`. Note if the project failed to compile after the above command, enter `/* eslint-disable */` comment in the start of the above files to disable eslint in them.