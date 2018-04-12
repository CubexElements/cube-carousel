import '@kubex/cube-action/cube-action.js';
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';

/**
 @license
 Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt

 Based on flex order concept found at https://blog.madewithenvy.com/the-order-property-flexbox-carousels-87a168567820
 */
/**
 An element providing a solution to no problem in particular.

 Example:

 <style>
 cube-carousel > div {
        color: #1c1c1c;
        text-align: center;
        background: #5c5c5c;
        padding: 80px 30px;
      }

 cube-carousel > div:nth-child(even) {
        background: #7c7c7c;
      }
 </style>

 <cube-carousel count="3">
 <div>1</div>
 <div>2</div>
 <div>3</div>
 <div>4</div>
 <div>5</div>
 <div>6</div>
 </cube-carousel>

 @demo demo/index.html
 @hero hero.svg
 */
class CubeCarousel extends GestureEventListeners(PolymerElement) {
  static get is() {return 'cube-carousel'}

  static get template()
  {
    return html`<style>
       :host {
        display: block;
        position: relative;
        box-sizing: border-box;
        @apply --cube-carousel-style;
        --cube-carousel-width: calc(100% / var(--cube-carousel-count, 5));
        --cube-carousel-offset: calc(calc(-1 * var(--cube-carousel-margin, 20px) * 2) * var(--cube-carousel-count, 5));
      }

       :host #carouselContainer {
        box-sizing: border-box;
        margin: 24px;
        overflow: hidden;
      }

       :host #carousel {
        box-sizing: border-box;
        display: flex;
        flex-wrap: nowrap;
        position: relative;
        height: 100%;
        transform: translateX(var(--cube-carousel-width, 100%));
        margin-right: calc(-1 * var(--cube-carousel-offset, 0));
      }

       :host([can-scroll]) #carousel {
        left: calc(-1 * var(--cube-carousel-width, 100%));
      }

       :host #carousel[is-reversing] {
        transform: translateX(calc(-1 * var(--cube-carousel-width, 100%)));
      }

       :host #carousel[is-set] {
        transform: none;
        transition: transform 500ms cubic-bezier(0.23, 1, 0.32, 1);
      }

       :host #carousel ::slotted(*) {
        box-sizing: border-box;
        order: 2;
        flex: 1 0 100%;
        flex-basis: var(--cube-carousel-width, 100%);
        width: var(--cube-carousel-width, 20px);
        min-width: var(--cube-carousel-width, 20px);
        height: 100%;
        min-height: 40px;
        margin: var(--cube-carousel-margin, 20px);
      }

       :host([can-scroll]) #prev,
       :host([can-scroll]) #next {
        display: block;
      }

      cube-action {
        padding: 0;
        --cube-icon-padding: 0;
      }

       :host #prev:hover,
       :host #next:hover {
        opacity: 0.9;
      }

       :host #prev,
       :host #next {
        display: none;
        z-index: 9999;
        position: absolute;
        top: 50%;
        margin-top: -24px;
        border-radius: 1000px;
        transition: opacity 200ms;
        opacity: 0.6;
      }

       :host #prev {
        left: 0;
      }

       :host #next {
        right: 0;
      }
    </style>

    <div id="prev" on-tap="_prev">
      <cube-action size="45" icon="icons:chevron-left"></cube-action>
    </div>
    <div id="next" on-tap="_next">
      <cube-action size="45" icon="icons:chevron-right"></cube-action>
    </div>
    <div id="carouselContainer">
      <div id="carousel" is-set$="[[_isSet]]" is-reversing$="[[_isReversing]]">
        <slot id="cSlot"></slot>
      </div>
    </div>`
  }

  static get properties()
  {
    return {
      count:     {type: Number, value: 5},
      canScroll: {type: Boolean, value: false, readOnly: true, reflectToAttribute: true},

      _isSet:       {type: Boolean, value: true},
      _isReversing: {type: Boolean, value: false},
      _elements:    {type: Array},
      _current:     {type: Object, observer: '_reorder'}
    }
  }

  static get observers()
  {
    return ['_refreshDisplayCount(_elements,count)'];
  }

  static get _elementMatchSelector()
  {
    return ':not(dom-repeat):not(dom-if):not(template)';
  }

  connectedCallback()
  {
    super.connectedCallback();
    let self = this;
    this.$.cSlot.addEventListener('slotchange', function () {
      self._elements = self.querySelectorAll(CubeCarousel._elementMatchSelector);
    });
  }

  _prev()
  {
    this._move(true);
  }

  _next()
  {
    this._move(false);
  }

  _move(reverse)
  {
    this._isReversing = !!reverse;
    this._isSet = false;
    if(reverse)
    {
      this._current = this.constructor._findPreviousSibling(this._current);
    }
    else
    {
      this._current = this.constructor._findNextSibling(this._current);
    }
    setTimeout(function () { this._isSet = true; }.bind(this), 50);
  }

  static _findNextSibling(current)
  {
    let next = current;
    while((next = (next.nextElementSibling || next.parentNode.firstElementChild)) && (next !== current))
    {
      if(next.matches(CubeCarousel._elementMatchSelector))
      {
        break;
      }
    }
    return next
  }

  static _findPreviousSibling(current)
  {
    let previous = current;
    while((previous = (previous.previousElementSibling || previous.parentNode.lastElementChild)) && (previous !== current))
    {
      if(previous.matches(CubeCarousel._elementMatchSelector))
      {
        break;
      }
    }
    return previous
  }

  _reorder(current)
  {
    current.style.order = 1;
    let next = current,
      i = 2;
    while((next = this.constructor._findNextSibling(next)) && (next !== current))
    {
      next.style.order = i++;
    }
  }

  _refreshDisplayCount(elements, count)
  {
    if(elements)
    {
      if(count > elements.length)
      {
        count = elements.length;
      }

      if((count) && elements.length > count)
      {
        this._current = elements[elements.length - 1];
        this._setCanScroll(true);
      }
      else
      {
        this._current = elements[0];
        this._setCanScroll(false);
      }
    }
    else
    {
      count = 1;
    }
    this.updateStyles({'--cube-carousel-count': count});
  }
}

customElements.define(CubeCarousel.is, CubeCarousel);