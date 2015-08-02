var assert = require('assert');
var sinon = require('sinon');
var rewire = require('rewire');
var mock = require('mock-fs');

var cabinet = rewire('../');

describe('filing-cabinet', function() {
  describe('JavaScript', function() {
    beforeEach(function() {
      mock({
        'js': {
          'es6': {
            'foo.js': 'import bar from "./bar";',
            'bar.js': 'export default function() {};'
          },
          'amd': {
            'foo.js': 'define(["./bar"], function(bar){ return bar; });',
            'bar.js': 'define({});'
          },
          'commonjs': {
            'foo.js': 'var bar = require("./bar");',
            'bar.js': 'module.exports = function() {};'
          }
        }
      });
    });

    describe('es6', function() {
      it('uses a generic resolver', function() {
        var stub = sinon.stub();
        var revert = cabinet.__set__('resolveDependencyPath', stub);

        var path = cabinet({
          partial: './bar',
          filename: 'js/es6/foo.js',
          directory: 'js/es6/'
        });

        assert.ok(stub.called);

        revert();
      });
    });

    describe('amd', function() {
      it('uses the amd resolver', function() {
        var stub = sinon.stub();
        var revert = cabinet.__set__('amdLookup', stub);

        var path = cabinet({
          partial: './bar',
          filename: 'js/amd/foo.js',
          directory: 'js/amd/'
        });

        assert.ok(stub.called);

        revert();
      });
    });

    describe('commonjs', function() {
      it('uses require\'s resolver', function() {
        var stub = sinon.stub();
        var revert = cabinet.__set__('commonJSLookup', stub);

        var path = cabinet({
          partial: './bar',
          filename: 'js/commonjs/foo.js',
          directory: 'js/commonjs/'
        });

        assert.ok(stub.called);

        revert();
      });
    });
  });

  describe('CSS', function() {
    describe('Sass', function() {
      it('uses the sass resolver for .scss files', function() {
        var stub = sinon.stub();
        var revert = cabinet.__set__('sassLookup', stub);

        var path = cabinet({
          partial: './bar',
          filename: 'js/sass/foo.scss',
          directory: 'js/sass/'
        });

        assert.ok(stub.called);

        revert();
      });

      it('uses the sass resolver for .sass files', function() {
        var stub = sinon.stub();
        var revert = cabinet.__set__('sassLookup', stub);

        var path = cabinet({
          partial: './bar',
          filename: 'sass/foo.sass',
          directory: 'sass/'
        });

        assert.ok(stub.called);

        revert();
      });
    });

    describe('stylus', function() {
      it('uses the stylus resolver', function() {
        var stub = sinon.stub();
        var revert = cabinet.__set__('stylusLookup', stub);

        var path = cabinet({
          partial: './bar',
          filename: 'stylus/foo.styl',
          directory: 'stylus/'
        });

        assert.ok(stub.called);

        revert();
      });
    });
  });

  describe('.register', function() {
    it('registers a custom resolver for a given extension', function() {
      var stub = sinon.stub().returns('foo');
      cabinet.register('.foobar', stub);

      var path = cabinet({
        partial: './bar',
        filename: 'js/amd/foo.foobar',
        directory: 'js/amd/'
      });

      assert.ok(stub.called);
      assert.equal(path, 'foo');
    });

    it('allows does not break default resolvers', function() {
      var stub = sinon.stub().returns('foo');
      var stub2 = sinon.stub().returns('foo');

      var revert = cabinet.__set__('stylusLookup', stub2);

      cabinet.register('.foobar', stub);

      var path = cabinet({
        partial: './bar',
        filename: 'js/amd/foo.foobar',
        directory: 'js/amd/'
      });

      var path2 = cabinet({
        partial: './bar',
        filename: 'stylus/foo.styl',
        directory: 'stylus/'
      });

      assert.ok(stub.called);
      assert.ok(stub2.called);

      revert();
    });

    it('can be called multiple times', function() {
      var stub = sinon.stub().returns('foo');
      var stub2 = sinon.stub().returns('foo');

      cabinet.register('.foobar', stub);
      cabinet.register('.barbar', stub2);

      var path = cabinet({
        partial: './bar',
        filename: 'js/amd/foo.foobar',
        directory: 'js/amd/'
      });

      var path2 = cabinet({
        partial: './bar',
        filename: 'js/amd/foo.barbar',
        directory: 'js/amd/'
      });

      assert.ok(stub.called);
      assert.ok(stub2.called);
    });
  });
});
