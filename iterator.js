(function(exports) {
  "use strict";

  function Iterator(config) {
  	var defaultConfig = {
  		cyclic: false, 
  		widthWindow: 1,
  		array: []
  	}

  	if (!!config)
	  for(var key in defaultConfig){
	  	if (config[key] != undefined) this[key] = config[key];
	  	else this[key] = defaultConfig[key];
	  }
  	else
  	  for(var key in defaultConfig)
  	  	this[key] = defaultConfig[key];	
    this.array.currentItem = 0;

    Array.observe(this.array, function(changes) {
      changes.forEach(function(change) {
        if (change.name == "currentItem") return;
        if (change.removed.length > 0) {
          var last_del = change.index + change.removed.length - 1;
          if (last_del > change.object.currentItem) 
            change.object.currentItem = Math.max(0, change.index - 1);
          else
            change.object.currentItem -= change.removed.length;
        }        
        if (change.index <= change.object.currentItem) 
          change.object.currentItem += change.addedCount;
      });
    });
  }

  Iterator.prototype.current = function() {
  	var width; 
  	if (this.cyclic) {
  		var result;
  		width = Math.min(this.array.length, this.widthWindow);
  		if (this.array.currentItem + width >= this.array.length - 1) {
  			result = this.array.slice(this.array.currentItem);
  			width -= this.array.length - this.array.currentItem;
  			return result.concat(this.array.slice(0, width));
  		}
  		else 
  			return this.array.slice(this.array.currentItem, this.array.currentItem + width);
  	}
  	else {
  		width = Math.min(this.array.length - this.array.currentItem, this.widthWindow);
  		return this.array.slice(this.array.currentItem, this.array.currentItem + width);
  	}  	
  }

  Iterator.prototype.jumpTo = function(arg) {
    if (arg == undefined) return;
    if (typeof(arg) == "number") {
      if (this.cyclic){
        if (arg < 0) 
          this.array.currentItem = arg % this.array.length + this.array.length;
        else if (arg < this.array.length) 
          this.array.currentItem = arg;
        else 
          this.array.currentItem = arg % this.array.length;
      }
      else {
        if (arg < 0 || arg >= this.array.length) 
          return console.error("Error position!");
        else this.array.currentItem = arg;
      }      
    }
    else this.jumpTo(arg(this.array.currentItem));
  }

  Iterator.prototype.forward = function(arg) {
    if (arg == undefined) {
      this.jumpTo(this.array.currentItem + 1);
      return this.current();
    }
    else if (typeof(arg) == "number") {
      this.jumpTo(this.array.currentItem + arg);
      return this.current();
    }
    else {
      this.jumpTo(this.array.currentItem + arg(this.array.currentItem));
      return this.current();
    }
  }

  Iterator.prototype.backward = function(arg) {
    if (arg == undefined) {
      this.jumpTo(this.array.currentItem - 1);
      return this.current();
    }
    else if (typeof(arg) == "number") {
      this.jumpTo(this.array.currentItem - arg);
      return this.current();
    }
    else {
      this.jumpTo(this.array.currentItem - arg(this.array.currentItem));
      return this.current();
    }
  }

  exports.Iterator = Iterator;
})(this);