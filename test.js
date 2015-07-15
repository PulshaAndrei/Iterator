var expect = chai.expect;

describe("Iterator", function() {

  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox.stub(window.console, "log");
    sandbox.stub(window.console, "error");
  });
  afterEach(function() {
    sandbox.restore();
  });

  describe("constructor", function() {
    it("should have an empty array and default config", function() {
      var iterator = new Iterator();
      expect(iterator.array).to.be.empty;
      expect(iterator.cyclic).to.equal(false);
      expect(iterator.widthWindow).to.equal(1);
    });

    it("should set config if provided", function() {
      var config = {
        cyclic: true,
        widthWindow: 3,
        array: ["1", 2, {"3": 3}]
      }
      var iterator = new Iterator(config);
      expect(iterator.array).to.equal(config.array);
      expect(iterator.cyclic).to.equal(true);
      expect(iterator.widthWindow).to.equal(3);
    });
  });

  describe("current()", function() {
    it("should return an empty array if the number of items 0 and array is non-cyclic", function() {
      var iterator = new Iterator();
      expect(iterator.current()).to.be.empty;
    });

    it("should return an empty array if the number of items 0 and array is cyclic", function() {
      var iterator = new Iterator({ cyclic: true});
      expect(iterator.current()).to.be.empty;
    });

    it("should return an array of length widthWindow if array is cyclic", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 3,
        cyclic: true
      });
      iterator.array.currentItem = 2;
      expect(iterator.current()).to.eql([{"3": 3}, "1", 2]);
    });

    it("should return an array of length widthWindow if array is non-cyclic", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2
      });
      iterator.array.currentItem = 1;
      expect(iterator.current()).to.eql([2, {"3": 3}]);
    });

    it("should return an array of length less then widthWindow if array is cyclic", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 4,
        cyclic: true
      });
      iterator.array.currentItem = 1;
      expect(iterator.current()).to.eql([2, { '3': 3 }, '1']);
    });

     it("should return an array of length less then widthWindow if array is non-cyclic", function() {
      var iterator = new Iterator({
        array: ["1", 2],
        widthWindow: 5
      });
      expect(iterator.current()).to.eql(["1", 2]);
    });
  });
  
  describe("jumpTo()", function() {
    it("currentItem should be changed to the position", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2
      });
      iterator.jumpTo(2);
      expect(iterator.array.currentItem).to.equal(2);
    });

    it("currentItem should be changed if position is longer than array.length and array is cyclic", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2,
        cyclic: true
      });
      iterator.jumpTo(2);
      expect(iterator.array.currentItem).to.equal(2);
    });

    it("currentItem should be changed if position is less than 0 and array is cyclic", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2,
        cyclic: true
      });
      iterator.jumpTo(-2);
      expect(iterator.array.currentItem).to.equal(1);
    });

    it("should log an error if position is longer than array.length and array is non-cyclic", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2
      });
      iterator.jumpTo(3);
      sinon.assert.calledWithExactly(console.error, "Error position!")
    });

    it("should log an error if position is less than 0 and array is non-cyclic", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2
      });
      iterator.jumpTo(-4);
      sinon.assert.calledWithExactly(console.error, "Error position!")
    });

    it("currentItem should be changed to the position of the return of the function", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2,
        cyclic: true
      });
      iterator.array.currentItem = 1;
      var next_position = function(current){
        return current+4;
      }
      iterator.jumpTo(next_position);
      expect(iterator.array.currentItem).to.equal(2);
    });
  });

  describe("forward()", function() {
    it ("should move on 1 item and return items", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2
      });
      expect(iterator.forward()).to.eql([2, {"3": 3}]);
    });

    it ("should move on n item and return items", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2,
        cyclic: true
      });
      expect(iterator.forward(2)).to.eql([{"3": 3}, "1"]);
    });

    it ("should move on function(n) item and return items", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2,
        cyclic: true
      });
      var next_position = function(current){
        return current % 2 + 1;
      }
      expect(iterator.forward(next_position)).to.eql([2, {"3": 3}]);
    });
  });

  describe("backward()", function() {
    it ("should move on 1 back item and return items", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2,
        cyclic: true
      });
      expect(iterator.backward()).to.eql([{"3": 3}, "1"]);
    });

    it ("should move on n back item and return items", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2,
        cyclic: true
      });
      expect(iterator.backward(2)).to.eql([2, {"3": 3}]);
    });

    it ("should move on function(n) back item and return items", function() {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}],
        widthWindow: 2,
        cyclic: true
      });
      var next_position = function(current){
        return current % 2 + 1;
      }
      expect(iterator.backward(next_position)).to.eql([{"3": 3}, "1"]);
    });
  });

  describe("observe", function() {
    it("currentItem should not change when you add item of the right of currentItem", function(done) {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}]
      });
      iterator.jumpTo(1);
      iterator.array.push("add");
      timeOut = function() {  
        expect(iterator.array.currentItem).to.equal(1); 
        done();
      }
      setTimeout("timeOut()", 10);
    });

    it("currentItem should change when you add item of the left (or ==) of currentItem", function(done) {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}]
      });
      iterator.jumpTo(2);      
      iterator.array.splice(1, 0, "add");
      timeOut = function() {  
        expect(iterator.array.currentItem).to.equal(3); 
        done();
      }
      setTimeout("timeOut()", 10);      
    });

    it("currentItem should not change when you remove item of the right of currentItem", function(done) {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}]
      });
      iterator.jumpTo(1);
      iterator.array.splice(2, 1);
      timeOut = function() {  
        expect(iterator.array.currentItem).to.equal(1); 
        done();
      }
      setTimeout("timeOut()", 10);
    });

    it("currentItem should not change when you remove item of the left of currentItem", function(done) {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}]
      });
      iterator.jumpTo(2);
      iterator.array.splice(1, 1);
      timeOut = function() {  
        expect(iterator.array.currentItem).to.equal(1); 
        done();
      }
      setTimeout("timeOut()", 10);
    });

    it("currentItem should not change when you remove currentItem", function(done) {
      var iterator = new Iterator({
        array: ["1", 2, {"3": 3}]
      });
      iterator.jumpTo(1);
      iterator.array.splice(1, 1);
      timeOut = function() {  
        expect(iterator.array.currentItem).to.equal(0); 
        done();
      }
      setTimeout("timeOut()", 10);
    });
    
  });

});