(function ($){

$.fn.longList = function(options) {
    var opts = $.extend( {}, $.fn.longList.defaults, options);
    return this.each(function() {
        new LongList(this, opts);
    });
};

$.fn.longList.defaults = {
    'sectionItemLength': 200
};

function LongList(el, opts){
    this.rAF = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame;
    this.parent = $(opts.parent);
    this.id = this.parent.attr('id') + '-long-list-';
    this.el = $(el);
    this.el.empty();
    this.invisibleClassName = opts.invisibleClassName || 'invisible';
    this.templateVars = opts.templateVars;
    this.items = opts.items;
    this.itemHeight = opts.itemHeight;
    this.totalHeight = this.items.length * this.itemHeight;
    this.template = opts.template;
    this.sections = [];
    this.sectionHeights = [];
    this.sectionItemLength = opts.sectionItemLength;
    this.sectionCount = Math.floor(this.items.length / this.sectionItemLength);
    if(this.items.length % this.sectionItemLength !== 0){
        this.sectionCount ++;
    }
    this.sumHeight = 0;
    this.sumHeight = this.html(0, this.sumHeight);
    this.renderNumber = 0;
    this.renderInterval = setInterval(
        function(){
            this.renderNumber ++;
            if(this.renderNumber < this.sectionCount){
                this.sumHeight = this.html(this.renderNumber, this.sumHeight);
            }
            else{
                this.el.trigger('render');
                clearInterval(this.renderInterval);
                this.addListeners();
            }
        }.bind(this),
        20
    );
    this.removeListeners();
    this.show(0);
    return this;
}

LongList.prototype.html = function(i, sumHeight){
    var start = i * this.sectionItemLength;
    var items = this.items.slice(start, i * this.sectionItemLength + this.sectionItemLength);
    this.sections.push(items);
    var height = items.length * this.itemHeight;
    var bottom = sumHeight - (this.itemHeight * 10);
    var top = sumHeight + height; 
    var id = this.id + i;
    this.sectionHeights.push(
        {
            'id': '#' + id,
            'bottom': bottom,
            'top': top,
            'visible': false
        }
    );
    var sectionWrapper = $('<div id="' + id + '"></div>');
    var templateVars = $.extend(
        {
            'items': items,
            'startIndex': start
        },
        this.templateVars
    );
    var html = this.template(templateVars);
    this.requestAnimationFrame(
        function(){
            $(sectionWrapper)
                .html(html)
                .addClass(this.invisibleClassName);
            this.el.append(sectionWrapper);
        }.bind(this)
    );
    sumHeight += height;  
    return sumHeight; 
}

LongList.prototype.requestAnimationFrame = function(fn){
    var r = this.rAF;
    r(fn.bind(this));   
}

LongList.prototype.addListeners = function(){
    this.bindedOnScroll = $.proxy(this.onScroll, this);
    this.parent.on('scroll', this.bindedOnScroll);
}

LongList.prototype.removeListeners = function(){
    this.parent.off('scroll');
}

LongList.prototype.show = function(sectionNumber){
    if(this.sectionHeights[sectionNumber].visible === false){
        this.requestAnimationFrame(
            function(){
                var el = $(this.sectionHeights[sectionNumber].id);
                el.removeClass(this.invisibleClassName);
                this.sectionHeights[sectionNumber].visible = true;
            }
        );
    }
}

LongList.prototype.hide = function(sectionNumber){
    if(this.sectionHeights[sectionNumber].visible === true){
        this.requestAnimationFrame(
            function(){
                var el = $(this.sectionHeights[sectionNumber].id);
                el.addClass(this.invisibleClassName);
                this.sectionHeights[sectionNumber].visible = false;
            }
        );
    }
}

LongList.prototype.onScroll = function(e){
    var percentage = Math.floor(this.parent.scrollTop() * 100 / this.totalHeight);
    var scrollTop = this.parent.scrollTop();
    for(var i in this.sectionHeights){
        var section = this.sectionHeights[i];
        if(scrollTop > section.bottom && scrollTop < section.top){
            this.show(i);
        }
        else{
            this.hide(i);
        }
    }
}

}($)); // end