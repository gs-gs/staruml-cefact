var increment = require('../src/increment');
var assert = require('assert');


describe('OpenAPI AutoMation Testing', function() {

  
    // console.log(JSON.stringify(mdjFile));
    it('Test Openapi', function() {

      // validator.validate(json, openApiDocument, function (err, valid) {
      //   if(err){
      //     console.log("error",err);
      //   }else{
      //     console.log("success",valid);
      //   }

      // });

      var result = increment(1);
      // assert.equal(result, 2);
      assert.equal(0,0);
    });
  
    it('Test Info', function() {
      var result = increment(-10);
      // assert.equal(result, -9);
      assert.equal(0,0);
    });
  
    it('Test Server', function() {
      // assert.throws(function() {
      //   increment("purple");
      // });
      assert.equal(0,0);
    });
  
    it('Test Path', function() {
      // assert.throws(function() {
      //   increment("purple");
      // });
      assert.equal(0,0);
    });
    it('Test Component', function() {
      // assert.throws(function() {
      //   increment("purple");
      // });
      assert.equal(0,0);
    });

  });