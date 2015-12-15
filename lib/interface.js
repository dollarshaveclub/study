import $ from 'jquery';
import storage from '../vendor/storage';

const storageKey = 'ab-tests';
let initialized = false;

export default class TestInterface {
  constructor () {

    if(initialized) return console.warn('AB Test Interface already initialized');

    this.key = storageKey;
    this.tests = storage.local.getItem(this.key);
    try {
      this.tests = JSON.parse(this.tests) || {};
    } catch (e) {
      this.tests = {};
    }

    this.$styles = this.styles();
    this.$styles.appendTo('head');

    this.$template = this.template();
    this.$template.appendTo('body');

    this.listen(this.update);

    initialized = true;
  }

  styles () {
    return $(
      `<style type="text/css">
        [data-ab-tester] {
          background: #111 url(http://i.imgur.com/lnDx7VT.jpg) center center repeat;
          border: 1px solid rgba(0, 0, 0, 0.5);
          border-radius: 5px;
          color: #fff;
          padding: 10px;
          position: fixed;
          font-family: sans-serif;
          right: 10px;
          text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
          top: 10px;
          width: 200px;
          z-index: 9;
          -webkit-font-smoothing: antialiased;
        }
        [data-ab-tester] ul {
          list-style-type: none;
          margin: 0;
          padding: 0;
        }
        [data-ab-tester] ul li:not(:last-child) {
          margin-bottom: 15px;
        }
        [data-ab-tester] label {
          margin-bottom: 5px;
          font-weight: bold;
          display: block;
        }
        [data-ab-tester] select {
          display: block;
          width: 100%;
        }
      </style>`
    );
  }

  template () {
    let $container = $('<div data-ab-tester></div>');
    let $ul = $('<ul></ul>');
    let tests = this.tests;
    let keys = Object.keys(tests);

    if (keys.length === 0) {
      $container.html('<b>No Tests</b>');
      return $container;
    }

    // Append tests
    keys.sort().forEach(test => {
      let chosen = tests[test].bucket;
      let options = tests[test].buckets.map(bucket => `<option${chosen === bucket ? ' selected' : ''}>${bucket}</option>`);
      $ul.append(
        `<li>
          <label>${test}</label>
          <select data-test="${test}">${options}</select>
        </li>`
      );
    });

    $ul.appendTo($container);
    return $container;
  }

  listen (update) {
    let tests = this.tests;
    this.$template.find('select').on('change', e => {
      var $this = $(e.target);
      let test = $this.data('test');
      let bucket = $this.val();
      tests[test].bucket = bucket;
      update.call(this);
    });
  }

  update () {
    storage.local.setItem(this.key, JSON.stringify(this.tests));
  }
}
