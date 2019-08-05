/**
 * @fileoverview gRPC-Web generated client stub for 
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */


const grpc = {};
grpc.web = require('grpc-web');

const proto = require('./image_swap_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.FaceSwapClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

  /**
   * @private @const {?Object} The credentials to be used to connect
   *    to the server
   */
  this.credentials_ = credentials;

  /**
   * @private @const {?Object} Options for the client
   */
  this.options_ = options;
};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.FaceSwapPromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

  /**
   * @private @const {?Object} The credentials to be used to connect
   *    to the server
   */
  this.credentials_ = credentials;

  /**
   * @private @const {?Object} Options for the client
   */
  this.options_ = options;
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.ImageFileIn,
 *   !proto.ImageFileOut>}
 */
const methodDescriptor_FaceSwap_faceSwap = new grpc.web.MethodDescriptor(
  '/FaceSwap/faceSwap',
  grpc.web.MethodType.UNARY,
  proto.ImageFileIn,
  proto.ImageFileOut,
  /** @param {!proto.ImageFileIn} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.ImageFileOut.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.ImageFileIn,
 *   !proto.ImageFileOut>}
 */
const methodInfo_FaceSwap_faceSwap = new grpc.web.AbstractClientBase.MethodInfo(
  proto.ImageFileOut,
  /** @param {!proto.ImageFileIn} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.ImageFileOut.deserializeBinary
);


/**
 * @param {!proto.ImageFileIn} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.ImageFileOut)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.ImageFileOut>|undefined}
 *     The XHR Node Readable Stream
 */
proto.FaceSwapClient.prototype.faceSwap =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/FaceSwap/faceSwap',
      request,
      metadata || {},
      methodDescriptor_FaceSwap_faceSwap,
      callback);
};


/**
 * @param {!proto.ImageFileIn} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.ImageFileOut>}
 *     A native promise that resolves to the response
 */
proto.FaceSwapPromiseClient.prototype.faceSwap =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/FaceSwap/faceSwap',
      request,
      metadata || {},
      methodDescriptor_FaceSwap_faceSwap);
};


module.exports = proto;

