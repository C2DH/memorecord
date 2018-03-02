
  function ModalSlides(options){
    
    var _self = this;
    
    // boolean properties
    this.is_visible = false;
    this.is_empty = true;
    this.selected = null; // the selected slide ;)
    this.data = []; 

    this.init = function(modalSelector, slideSelector, slideContainerSelector, language) {
      this.language = language;

      this._modal = d3.select(modalSelector);
      this._modal_title = this._modal.select('.description');
      this._modal_date = this._modal.select('.header .date');
      this._modal_provider = this._modal.select('.provider');
      this._modal_close = this._modal.select('.close');
      this._container= d3.select(slideContainerSelector);

      // .selectAll("circle"); d3.selectAll(slideSelector);
      this.is_empty = this._modal.empty() || this._container.empty();
      
      if(this.is_empty){
        console.warn('ModalSlides: check modalSelector param, given:', modalSelector)
        // return;
      } else {

        // build social media wrapper!
        this._slides = this._container.selectAll("social-media-wrapper");
      
      }

      document.onkeydown = function(evt) {
        evt = evt || window.event;
        if (evt.keyCode == 27 && _self.is_visible) {
          _self.hide();
        }
      };

      this._modal_close.on('click', _self.hide);
      
      console.log('ModalSlides on', modalSelector)
    }

    this.onclick = function(datum, idx, listof) {
      console.log('ModalSlides slides@click', idx, datum.id, datum);
      if(_self.selected && _self.selected.id != datum.id){
        // selection change!
        _self._selected.classed('active', false)
      }
      _self.selected = datum;
      // selected elements
      _self._selected = d3.select(this);
      _self._selected.classed('active', true);

      _self.show();
    }

    this.hide = function(){
      if(!_self.is_empty) {
        
        if(_self.selected)
          _self._selected.classed('active', false)
        return;
      }

      _self._modal.classed('show', false)
        .transition()
        .delay(150) // decay value
        .style('display', 'none');
    }

    this.show = function() {
      
      this.is_visible = true;
      // fill html before showing the modal
      _self._modal_title.html('<img src="'+_self.selected.image+'" /><div class="inner">' + _self.selected.description + '</div>');
      _self._modal_date.text(_self.toLocaleDateString(_self.selected.date ));
      _self._modal_provider.html('<a href="'+_self.selected.url + '" target="_blank">' + _self.selected.provider + '</a>');
      _self._modal.classed('show', true)
        .style('display', 'block');
    }

    this.goto = function(datum) {
      _self.selected = datum;
      _self.show();
    }

    this.update = function(data) {
      console.log(data.length);
      _self.data = data;
      if(_self.is_empty)
        return;
      _self._slides = _self._slides.data(data, function(d) { 
        return d.id;
      });
      _self._slides.exit().remove();
      // should use mustache
      var slides = _self._slides.enter()
        .append("div").attr("class", 'col-6 col-sm-3 social-media-wrapper')
          .append('div').classed('social-media', true)

      // handler
      slides.on("click", _self.onclick);

      // if has image
      slides
        .append('div').classed('image-wrapper', true)
          .append('div').classed('image', true)
          .style('background-image', function(d) {
            return d.image? 'url('+d.image+')':'none'
          })

      // description
      slides
        .append('div').classed('description-wrapper', true)
        .append('div').classed('description', true)
          .html(function(d){
            if(d.date){
              var date = _self.toLocaleDateString(d.date);
              return '<span class="date">'+ date +'</span>  &ndash; ' + d.description
            }
            return d.description
          })
    
    }

    this.toLocaleDateString = function(date) {
      var date = new Date(date) 
      return date.toLocaleDateString(_self.language, { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
    }

    this.init(options.modalSelector, options.slideSelector, options.slideContainerSelector, options.language || 'en');
  }